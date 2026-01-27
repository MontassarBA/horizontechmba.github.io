export interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGINS: string; // comma-separated
  RECAPTCHA_SECRET: string; // reCAPTCHA secret key
}

// Rate limiting store (KV in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function sanitizeHtml(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .substring(0, 5000); // Max 5000 chars
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email));
}

async function verifyRecaptcha(token: string, secret: string): Promise<boolean> {
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });
    const data = await res.json();
    return data.success && (data.score || 0) > 0.5; // Require score > 0.5
  } catch (err) {
    return false;
  }
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 3600000 }); // 1 hour window
    return true;
  }
  if (limit.count >= 5) return false; // Max 5 requests per hour
  limit.count++;
  return true;
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  const isAllowed = origin && allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const baseHeaders = corsHeaders(origin, allowed);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: baseHeaders });
    }

    if (url.pathname !== '/contact' || request.method !== 'POST') {
      return new Response('Not Found', { status: 404, headers: baseHeaders });
    }

    try {
      const body = await request.json();
      const { name, company, email, subject, message, locale, recaptchaToken } = body || {};
      
      // Validate required fields
      if (!name || !email || !message || !recaptchaToken) {
        return jsonResponse({ error: 'Missing required fields' }, 400, baseHeaders);
      }

      // Validate email format
      if (!validateEmail(email)) {
        return jsonResponse({ error: 'Invalid email format' }, 400, baseHeaders);
      }

      // Check rate limit by IP
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (!checkRateLimit(ip)) {
        return jsonResponse({ error: 'Rate limit exceeded' }, 429, baseHeaders);
      }

      // Verify reCAPTCHA token
      if (!env.RECAPTCHA_SECRET) {
        return jsonResponse({ error: 'reCAPTCHA not configured' }, 500, baseHeaders);
      }
      const captchaValid = await verifyRecaptcha(recaptchaToken, env.RECAPTCHA_SECRET);
      if (!captchaValid) {
        return jsonResponse({ error: 'reCAPTCHA verification failed' }, 403, baseHeaders);
      }

      // Sanitize all inputs
      const sanitized = {
        name: sanitizeHtml(name),
        company: sanitizeHtml(company || ''),
        email: sanitizeHtml(email),
        subject: sanitizeHtml(subject || 'Contact'),
        message: sanitizeHtml(message),
        locale: sanitizeHtml(locale || '')
      };

      // Compose email via Resend API
      const html = `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 12px">New Contact Message</h2>
          <p><strong>Name:</strong> ${sanitized.name}</p>
          <p><strong>Company:</strong> ${sanitized.company}</p>
          <p><strong>Email:</strong> ${sanitized.email}</p>
          <p><strong>Subject:</strong> ${sanitized.subject}</p>
          <p><strong>Locale:</strong> ${sanitized.locale}</p>
          <p><strong>IP Address:</strong> ${ip}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${sanitized.message}</p>
        </div>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL,
          to: env.TO_EMAIL,
          subject: `[Contact] ${sanitized.subject} — ${sanitized.name}`,
          html
        })
      });

      if (!resendRes.ok) {
        const text = await resendRes.text();
        return jsonResponse({ error: 'Email send failed' }, 502, baseHeaders);
      }

      return jsonResponse({ success: true }, 200, baseHeaders);
    } catch (err) {
      return jsonResponse({ error: 'Server error' }, 500, baseHeaders);
    }
  }
};
