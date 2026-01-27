#!/usr/bin/env node

/**
 * HORIZONTECH MBA - E2E Contact Form Smoke Test
 * This test performs a CORS preflight (OPTIONS) request against the contact API.
 * It passes if the endpoint responds with a 200-204 status and proper headers.
 * Requires env PUBLIC_CONTACT_API_URL to be set (e.g., in GitHub Actions secrets).
 */

import 'node:process';

const apiUrl = process.env.PUBLIC_CONTACT_API_URL;

if (!apiUrl) {
  console.log('SKIP: PUBLIC_CONTACT_API_URL not set. Skipping E2E contact test.');
  process.exit(0);
}

const origin = 'https://www.horizontechmba.com';

async function run() {
  try {
    const resp = await fetch(apiUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    const statusOk = resp.status >= 200 && resp.status <= 204;
    const allowOrigin = resp.headers.get('access-control-allow-origin');
    const allowMethods = resp.headers.get('access-control-allow-methods');

    if (statusOk && allowOrigin && allowMethods && allowOrigin.includes(origin) && allowMethods.includes('POST')) {
      console.log('✅ PASS: E2E CORS preflight succeeded for contact API');
      process.exit(0);
    } else {
      console.error('❌ FAIL: E2E CORS preflight failed');
      console.error(`Status: ${resp.status}`);
      console.error(`Access-Control-Allow-Origin: ${allowOrigin}`);
      console.error(`Access-Control-Allow-Methods: ${allowMethods}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ FAIL: E2E contact test error:', err?.message || err);
    process.exit(1);
  }
}

run();
