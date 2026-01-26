export interface Env {
  RESEND_API_KEY: string;
  TO_EMAIL: string;
  FROM_EMAIL: string;
  ALLOWED_ORIGINS: string; // comma-separated
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
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
      const { name, company, email, subject, message, locale } = body || {};
      if (!name || !email || !message) {
        return new Response('Invalid payload', { status: 400, headers: baseHeaders });
      }

      // Compose email via Resend API
      const html = `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">
          <h2 style="margin:0 0 12px">New Contact Message</h2>
          <p><strong>Name:</strong> ${String(name)}</p>
          <p><strong>Company:</strong> ${String(company || '')}</p>
          <p><strong>Email:</strong> ${String(email)}</p>
          <p><strong>Subject:</strong> ${String(subject || 'Contact')}</p>
          <p><strong>Locale:</strong> ${String(locale || '')}</p>
          <hr/>
          <p><strong>Message:</strong></p>
          <p>${String(message).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
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
          subject: `Contact: ${subject || 'Contact'} — ${name}`,
          html
        })
      });

      if (!resendRes.ok) {
        const text = await resendRes.text();
        return new Response(text || 'Email send failed', { status: 502, headers: baseHeaders });
      }

      return new Response('OK', { status: 200, headers: baseHeaders });
    } catch (err) {
      return new Response('Server error', { status: 500, headers: baseHeaders });
    }
  }
};
