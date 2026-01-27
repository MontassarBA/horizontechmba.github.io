#!/usr/bin/env node

/**
 * HORIZONTECH MBA - Functional Testing Suite
 * Tests complets de fonctionnalité avant déploiement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

let passCount = 0;
let failCount = 0;
const results = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return null;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function test(name, condition, details = '') {
  const status = condition ? 'PASS' : 'FAIL';
  const color = condition ? 'green' : 'red';
  
  if (condition) {
    log(`✅ ${status}: ${name}`, color);
    passCount++;
  } else {
    log(`❌ ${status}: ${name}`, color);
    if (details) log(`   └─ ${details}`, 'yellow');
    failCount++;
  }
  results.push({ name, status, details });
}

// ========================================
// 1. Page Structure Tests
// ========================================
log('\n📄 TEST 1: Page Structure & Routing\n', 'cyan');

const pages = [
  { path: 'index.html', name: 'Home Redirect' },
  { path: 'en/index.html', name: 'EN Home' },
  { path: 'fr/index.html', name: 'FR Home' },
  { path: 'en/about/index.html', name: 'EN About' },
  { path: 'fr/about/index.html', name: 'FR About' },
  { path: 'en/services/index.html', name: 'EN Services' },
  { path: 'fr/services/index.html', name: 'FR Services' },
  { path: 'en/contact/index.html', name: 'EN Contact' },
  { path: 'fr/contact/index.html', name: 'FR Contact' },
  { path: 'en/cookies/index.html', name: 'EN Cookies' },
  { path: 'fr/cookies/index.html', name: 'FR Cookies' },
  { path: '404.html', name: '404 Page' },
];

pages.forEach(page => {
  const fullPath = path.join(distDir, page.path);
  const exists = fileExists(fullPath);
  test(`Page exists: ${page.name}`, exists, `Path: ${page.path}`);
});

// ========================================
// 2. i18n & Language Detection
// ========================================
log('\n🌍 TEST 2: i18n Configuration & Language\n', 'cyan');

const frHome = readFile(path.join(distDir, 'fr/index.html'));
const enHome = readFile(path.join(distDir, 'en/index.html'));

test('FR Home has French content', frHome && frHome.includes('Notre Engagement'));
test('EN Home has English content', enHome && enHome.includes('Our Commitment'));
test('FR Home has lang="fr"', frHome && frHome.includes('lang="fr"'));
test('EN Home has lang="en"', enHome && enHome.includes('lang="en"'));

const indexRedirect = readFile(path.join(distDir, 'index.html'));
test('Home page redirects to /fr/', indexRedirect && (indexRedirect.includes('http-equiv="refresh"') || indexRedirect.includes('window.location')) && indexRedirect.includes('/fr/'));

// ========================================
// 3. Contact Form Tests
// ========================================
log('\n📧 TEST 3: Contact Forms & reCAPTCHA\n', 'cyan');

const frContact = readFile(path.join(distDir, 'fr/contact/index.html'));
const enContact = readFile(path.join(distDir, 'en/contact/index.html'));

test('FR Contact form exists', frContact && frContact.includes('<form'));
test('EN Contact form exists', enContact && enContact.includes('<form'));
test('FR Contact has email input', frContact && frContact.includes('type="email"'));
test('EN Contact has email input', enContact && enContact.includes('type="email"'));
test('FR Contact has reCAPTCHA script', frContact && frContact.includes('www.google.com/recaptcha/api.js'));
test('EN Contact has reCAPTCHA script', enContact && enContact.includes('www.google.com/recaptcha/api.js'));
test('FR Contact has grecaptcha.execute', frContact && frContact.includes('grecaptcha.execute'));
test('EN Contact has grecaptcha.execute', enContact && enContact.includes('grecaptcha.execute'));

// ========================================
// 4. Analytics Integration
// ========================================
log('\n📊 TEST 4: Analytics (GA4 & GTM)\n', 'cyan');

const layout = readFile(path.join(projectRoot, 'src/layouts/Layout.astro'));

test('GA4 ID configured (G-6RR6F0GWKH)', layout && layout.includes('G-6RR6F0GWKH'));
test('GTM ID configured (GTM-MB2PFGKF)', layout && layout.includes('GTM-MB2PFGKF'));
test('Google Tag Manager script', layout && layout.includes('googletagmanager.com'));

const cookieConsent = readFile(path.join(projectRoot, 'src/components/CookieConsent.astro'));
test('Cookie consent has GA4 ID', cookieConsent && cookieConsent.includes('G-6RR6F0GWKH'));

// ========================================
// 5. Security Headers
// ========================================
log('\n🔒 TEST 5: Security Headers\n', 'cyan');

const headers = readFile(path.join(distDir, '_headers'));

test('_headers file exists', headers !== null);
test('CSP header configured', headers && headers.includes('Content-Security-Policy'));
test('X-Frame-Options header', headers && headers.includes('X-Frame-Options: DENY'));
test('X-Content-Type-Options header', headers && headers.includes('X-Content-Type-Options: nosniff'));
test('HSTS preload enabled', headers && headers.includes('Strict-Transport-Security'));
test('Permissions-Policy configured', headers && headers.includes('Permissions-Policy'));
test('reCAPTCHA domains in CSP', headers && headers.includes('recaptcha'));
test('GTM domain in CSP', headers && headers.includes('googletagmanager.com'));

// ========================================
// 6. Booking Integration (Microsoft Bookings)
// ========================================
log('\n📅 TEST 6: Booking System Integration\n', 'cyan');

const bookingComponent = readFile(path.join(projectRoot, 'src/components/BookingCalendly.astro'));

test('BookingCalendly component exists', bookingComponent !== null);
test('Microsoft Bookings URL configured', bookingComponent && bookingComponent.includes('outlook.office.com/bookwithme'));
test('No Calendly references', !bookingComponent || !bookingComponent.includes('calendly.com'));
test('Button has correct href', bookingComponent && bookingComponent.includes('href='));

// ========================================
// 7. Phone Number Configuration
// ========================================
log('\n☎️ TEST 7: Phone Number Configuration\n', 'cyan');

const layoutForPhone = readFile(path.join(projectRoot, 'src/layouts/Layout.astro'));
const headerForPhone = readFile(path.join(projectRoot, 'src/components/Header.astro'));
const bookingForPhone = readFile(path.join(projectRoot, 'src/components/BookingCalendly.astro'));

test('Phone in Header (tel: link)', headerForPhone && headerForPhone.includes('tel:+15815783505'));
test('Phone in Layout (structured data)', layoutForPhone && layoutForPhone.includes('+1 (581) 578-3505'));
test('Phone in Booking component', bookingForPhone && bookingForPhone.includes('+1 (581) 578-3505'));

// ========================================
// 8. Domain & URL Configuration
// ========================================
log('\n🌐 TEST 8: Domain & URL Configuration\n', 'cyan');

const astroConfig = readFile(path.join(projectRoot, 'astro.config.mjs'));
const cname = readFile(path.join(projectRoot, 'CNAME'));

test('Astro site URL configured', astroConfig && astroConfig.includes('https://www.horizontechmba.com'));
test('CNAME file has www domain', cname && cname.includes('www.horizontechmba.com'));
test('i18n default locale is French', astroConfig && astroConfig.includes("defaultLocale: 'fr'"));
test('prefixDefaultLocale is false', astroConfig && astroConfig.includes('prefixDefaultLocale: false'));

// ========================================
// 9. Backend API Configuration
// ========================================
log('\n⚙️ TEST 9: Backend API & Cloudflare Worker\n', 'cyan');

const workerCode = readFile(path.join(projectRoot, 'serverless/cloudflare-worker-contact/src/index.ts'));

test('Worker has rate limiting', workerCode && workerCode.includes('checkRateLimit'));
test('Worker sanitizes HTML', workerCode && workerCode.includes('sanitizeHtml'));
test('Worker validates emails', workerCode && workerCode.includes('validateEmail'));
test('Worker verifies reCAPTCHA', workerCode && workerCode.includes('verifyRecaptcha'));
test('Worker has CORS whitelist', workerCode && workerCode.includes('ALLOWED_ORIGINS'));
test('Worker sends emails via Resend', workerCode && workerCode.includes('Resend'));

const envExample = readFile(path.join(projectRoot, '.env.example'));
test('.env.example has API URL placeholder', envExample && envExample.includes('PUBLIC_CONTACT_API_URL'));

// ========================================
// 10. Content Quality
// ========================================
log('\n✨ TEST 10: Content Quality\n', 'cyan');

const aboutPage = readFile(path.join(distDir, 'fr/about/index.html'));
const servicesPage = readFile(path.join(distDir, 'fr/services/index.html'));

test('About page has founder content', aboutPage && aboutPage.includes('Expertise'));
test('About page has 15+ years mention', aboutPage && aboutPage.includes('15'));
test('Services page has service descriptions', servicesPage && servicesPage.includes('service'));
test('No placeholder text in pages', !aboutPage || !aboutPage.includes('YOUR_FORM_ID'));

// ========================================
// 11. CSS & Styling
// ========================================
log('\n🎨 TEST 11: Styling & Assets\n', 'cyan');

const astsroCSS = readFile(path.join(projectRoot, 'src/styles/global.css'));
test('Tailwind CSS configured', astsroCSS !== null || fs.existsSync(path.join(projectRoot, 'tailwind.config.mjs')));

// Check for CSS files in dist
const distFiles = fs.readdirSync(path.join(distDir, '_astro')).filter(f => f.endsWith('.css'));
test('CSS files generated', distFiles.length > 0, `Found ${distFiles.length} CSS files`);

// ========================================
// 12. JavaScript & Interactivity
// ========================================
log('\n⚡ TEST 12: JavaScript & Interactivity\n', 'cyan');

const jsFiles = fs.readdirSync(path.join(distDir, '_astro')).filter(f => f.endsWith('.js'));
test('JavaScript files generated', jsFiles.length > 0, `Found ${jsFiles.length} JS files`);
test('reCAPTCHA integration script', enContact && enContact.includes('grecaptcha.execute'));

// Check if CookieConsent component exists in source
const cookieConsentComponent = readFile(path.join(projectRoot, 'src/components/CookieConsent.astro'));
test('Cookie consent component exists', cookieConsentComponent !== null);

// ========================================
// Summary
// ========================================
log('\n' + '═'.repeat(50), 'cyan');
log('  FUNCTIONAL TESTING RESULTS', 'cyan');
log('═'.repeat(50), 'cyan');

const total = passCount + failCount;
const percentage = ((passCount / total) * 100).toFixed(1);

if (failCount === 0) {
  log(`\n✅ All ${passCount} tests passed! (100%)`, 'green');
} else {
  log(`\n⚠️  Results: ${passCount} passed, ${failCount} failed out of ${total} tests (${percentage}%)`, failCount === 0 ? 'green' : 'yellow');
}

log('═'.repeat(50), 'cyan');

// Exit with appropriate code
process.exit(failCount > 0 ? 1 : 0);
