# Cloudflare Worker — Contact Email API

This Worker receives contact form submissions from the website and sends an email via Resend. It implements CORS and basic validation.

## Prerequisites
- Cloudflare account
- Resend account (or adapt to SendGrid/Mailgun)
- wrangler CLI installed

## Setup
1. Install dependencies:

```powershell
cd "serverless/cloudflare-worker-contact"; npm install
```

2. Configure wrangler and secrets:

```powershell
wrangler login
wrangler secret put RESEND_API_KEY
wrangler secret put TO_EMAIL
wrangler secret put FROM_EMAIL
```

3. Optional: set allowed origins in wrangler.toml `vars.ALLOWED_ORIGINS`.

4. Deploy:

```powershell
wrangler deploy
```

5. Copy the deployed URL and set it in the site env:

Create `.env` in the project root:

```
PUBLIC_CONTACT_API_URL=https://<your-worker-subdomain>.workers.dev/contact
```

## Local Dev

```powershell
wrangler dev
```

## Notes
- This Worker expects JSON body: `{ name, company, email, subject, message, locale }`.
- CORS allows only configured origins and `http://localhost:4321` for local Astro dev.
