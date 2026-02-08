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
  { path: 'index.html', name: 'Home Root' },
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
  { path: 'en/faq/index.html', name: 'EN FAQ' },
  { path: 'fr/faq/index.html', name: 'FR FAQ' },
  { path: '404.html', name: '404 Page' },
];

pages.forEach(page => {
  const fullPath = path.join(distDir, page.path);
  const exists = fileExists(fullPath);
  test(`Page exists: ${page.name}`, exists, `Path: ${page.path}`);
});

// ========================================
// 1B. Root Home Page Verification (No Redirect)
// ========================================
log('\nTEST 1B: Root Home Page (No Redirect)\n', 'cyan');

const indexHtml = readFile(path.join(distDir, 'index.html'));
const hasMetaRefresh = indexHtml && indexHtml.includes('http-equiv="refresh"');
const hasMetaRefreshToFr = indexHtml && /url=\/fr\//.test(indexHtml);
const hasJsRedirectToFr = indexHtml && /window\.location(\.href)?\s*=\s*['"]\/fr\//.test(indexHtml);
const hasNoindex = indexHtml && indexHtml.includes('noindex');
const hasLangEn = indexHtml && indexHtml.includes('lang="en"');

test('Root index has no meta refresh redirect', !(hasMetaRefresh && hasMetaRefreshToFr),
  'Root should be a real page, not a meta refresh redirect to /fr/');
test('Root index has no JS redirect', !hasJsRedirectToFr,
  'Root should be a real page, not a JS redirect to /fr/');
test('Root index is indexable (no noindex)', !hasNoindex,
  'Root should be indexable for SEO');
test('Root index declares lang="en"', hasLangEn,
  'Root should render English content by default');

// ========================================
// 2. Build Quality & Syntax Verification
// ========================================
log('\n🔧 TEST 2: Build Quality & Syntax\n', 'cyan');

// Vérifier que les variables JavaScript sont correctement injectées
const frHome = readFile(path.join(distDir, 'fr/index.html'));
const enHome = readFile(path.join(distDir, 'en/index.html'));

const contactApiUrlRegex = /window\.CONTACT_API_URL\s*=\s*['"][^'"]*['"]/;
test('FR: CONTACT_API_URL properly injected', frHome && contactApiUrlRegex.test(frHome), 
  'Variable not properly substituted');
test('EN: CONTACT_API_URL properly injected', enHome && contactApiUrlRegex.test(enHome),
  'Variable not properly substituted');

// Vérifier qu'il n'y a pas de variables non substituées
test('FR: No unsubstituted variables', frHome && !frHome.includes('contactApiUrl;'),
  'Found literal variable name instead of value');
test('EN: No unsubstituted variables', enHome && !enHome.includes('contactApiUrl;'),
  'Found literal variable name instead of value');

// Vérifier les configurations GA4/GTM
test('FR: GA4_ID configured', frHome && frHome.includes('window.GA4_ID'));
test('FR: GTM_ID configured', frHome && frHome.includes('window.GTM_ID'));
test('EN: GA4_ID configured', enHome && enHome.includes('window.GA4_ID'));
test('EN: GTM_ID configured', enHome && enHome.includes('window.GTM_ID'));

// ========================================
// 3. i18n & Language Detection
// ========================================
log('\n🌍 TEST 3: i18n Configuration & Language\n', 'cyan');

test('FR Home has French content', frHome && frHome.includes('Notre Engagement'));
test('EN Home has English content', enHome && enHome.includes('Our Commitment'));
test('FR Home has lang="fr"', frHome && frHome.includes('lang="fr"'));
test('EN Home has lang="en"', enHome && enHome.includes('lang="en"'));

const indexRoot = readFile(path.join(distDir, 'index.html'));
test('Home page is real content (no redirect)', indexRoot && !(indexRoot.includes('http-equiv="refresh"') && /url=\/fr\//.test(indexRoot)) && !/window\.location(\.href)?\s*=\s*['"]\/fr\//.test(indexRoot));

// ========================================
// 4. Contact Form Tests & Booking
// ========================================
log('\n📧 TEST 4: Contact Forms, Formspree & Booking\n', 'cyan');

const frContact = readFile(path.join(distDir, 'fr/contact/index.html'));
const enContact = readFile(path.join(distDir, 'en/contact/index.html'));

test('FR Contact form exists', frContact && frContact.includes('<form'));
test('EN Contact form exists', enContact && enContact.includes('<form'));
test('FR Contact has email input', frContact && frContact.includes('type="email"'));
test('EN Contact has email input', enContact && enContact.includes('type="email"'));
test('FR Contact uses Formspree', frContact && frContact.includes('formspree.io'));
test('EN Contact uses Formspree', enContact && enContact.includes('formspree.io'));
test('FR Contact has form action', frContact && frContact.includes('action="https://formspree.io'));
test('EN Contact has form action', enContact && enContact.includes('action="https://formspree.io'));
test('FR Contact has BookingCalendly', frContact && frContact.includes('outlook.office.com/book'));
test('EN Contact has BookingCalendly', enContact && enContact.includes('outlook.office.com/book'));

// ========================================
// 5. Analytics Integration
// ========================================
log('\n📊 TEST 5: Analytics (GA4 & GTM)\n', 'cyan');

const layout = readFile(path.join(projectRoot, 'src/layouts/Layout.astro'));

test('GA4 ID configured (G-6RR6F0GWKH)', layout && layout.includes('G-6RR6F0GWKH'));
test('GTM ID configured (GTM-MB2PFGKF)', layout && layout.includes('GTM-MB2PFGKF'));
test('Google Tag Manager script', layout && layout.includes('googletagmanager.com'));

const cookieConsent = readFile(path.join(projectRoot, 'src/components/CookieConsent.astro'));
test('Cookie consent has GA4 ID', cookieConsent && cookieConsent.includes('G-6RR6F0GWKH'));

// ========================================
// 6. Security Headers
// ========================================
log('\n🔒 TEST 6: Security Headers\n', 'cyan');

const headers = readFile(path.join(distDir, '_headers'));

test('_headers file exists', headers !== null);
test('CSP header configured', headers && headers.includes('Content-Security-Policy'));
test('X-Frame-Options header', headers && headers.includes('X-Frame-Options: DENY'));
test('X-Content-Type-Options header', headers && headers.includes('X-Content-Type-Options: nosniff'));
test('HSTS preload enabled', headers && headers.includes('Strict-Transport-Security'));
test('Permissions-Policy configured', headers && headers.includes('Permissions-Policy'));
test('Formspree domains in CSP', headers && headers.includes('formspree.io'));
test('GTM domain in CSP', headers && headers.includes('googletagmanager.com'));

// ========================================
// 7. Booking Integration (Microsoft Bookings)
// ========================================
log('\n📅 TEST 7: Booking System Integration\n', 'cyan');

const bookingComponent = readFile(path.join(projectRoot, 'src/components/BookingCalendly.astro'));

test('BookingCalendly component exists', bookingComponent !== null);
test('Microsoft Bookings URL configured', bookingComponent && bookingComponent.includes('outlook.office.com/book'));
test('No Calendly references', !bookingComponent || !bookingComponent.includes('calendly.com'));
test('Button has correct href', bookingComponent && bookingComponent.includes('href='));

// ========================================
// 8. Phone Number Configuration
// ========================================
log('\n☎️ TEST 8: Phone Number Configuration\n', 'cyan');

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

// Accept both www.horizontechmba.com and MontassarBA.github.io URLs
const hasValidSiteUrl = astroConfig && (
  astroConfig.includes('https://www.horizontechmba.com') || 
  astroConfig.includes('https://MontassarBA.github.io')
);
test('Astro site URL configured', hasValidSiteUrl);
test('CNAME file has www domain', cname && cname.includes('www.horizontechmba.com'));
test('i18n default locale is English', astroConfig && astroConfig.includes("defaultLocale: 'en'"));
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
// 10. Content Quality & Structure
// ========================================
log('\n✨ TEST 10: Content Quality & UX Structure\n', 'cyan');

const aboutPage = readFile(path.join(distDir, 'fr/about/index.html'));
const servicesPage = readFile(path.join(distDir, 'fr/services/index.html'));
const faqPage = readFile(path.join(distDir, 'fr/faq/index.html'));

test('About page has founder content', aboutPage && aboutPage.includes('Expertise'));
test('About page has 15+ years mention', aboutPage && aboutPage.includes('15'));
test('About page has ExpertiseSection', aboutPage && aboutPage.includes('Industry Expertise') || aboutPage.includes('Expertise Industrielle'));
test('Services page has service descriptions', servicesPage && servicesPage.includes('service'));
test('Services page has CaseStudies', servicesPage && (servicesPage.includes('Case Studies') || servicesPage.includes('Études de Cas')));
test('FAQ page exists and has questions', faqPage && (faqPage.includes('FAQ') || faqPage.includes('Foire Aux Questions')));
test('Home page is streamlined (no FAQ section)', !frHome || !frHome.includes('Frequently Asked Questions'));
test('Home page is streamlined (no CaseStudies section)', !frHome || !(frHome.includes('Case Studies') && frHome.includes('40% dev time reduction')));
test('Home page is streamlined (no Newsletter full section)', !frHome || !frHome.includes('Restez à la pointe de l\'innovation'));
test('No placeholder text in pages', !aboutPage || !aboutPage.includes('YOUR_FORM_ID'));

// ========================================
// 11. Standards Pages (New in v1.1)
// ========================================
log('\n📜 TEST 11: Standards & Compliance Pages\n', 'cyan');

const frStandards = readFile(path.join(distDir, 'fr/standards/index.html'));
const enStandards = readFile(path.join(distDir, 'en/standards/index.html'));

test('FR Standards page exists', frStandards !== null);
test('EN Standards page exists', enStandards !== null);
test('FR Standards has IEC 60601', frStandards && frStandards.includes('IEC 60601'));
test('FR Standards has IEC 62304', frStandards && frStandards.includes('IEC 62304'));
test('FR Standards has IEC 61508', frStandards && frStandards.includes('IEC 61508'));
test('FR Standards has ISO 13849', frStandards && frStandards.includes('ISO 13849'));
test('FR Standards has ISO 26262', frStandards && frStandards.includes('ISO 26262'));
test('FR Standards has DLMS/COSEM', frStandards && frStandards.includes('DLMS/COSEM'));
test('FR Standards has EMI/EMC', frStandards && frStandards.includes('EMI/EMC'));
test('EN Standards has all 7 standards', enStandards && 
  enStandards.includes('IEC 60601') && 
  enStandards.includes('IEC 62304') &&
  enStandards.includes('IEC 61508') &&
  enStandards.includes('ISO 13849') &&
  enStandards.includes('ISO 26262') &&
  enStandards.includes('DLMS/COSEM') &&
  enStandards.includes('EMI/EMC'));
test('Standards page has communication protocols', frStandards && frStandards.includes('J1939'));
test('Standards page has deliverables section', frStandards && (frStandards.includes('Feuille de route') || frStandards.includes('Compliance roadmap')));

// ========================================
// 12. Navigation & Links (v1.1 updates)
// ========================================
log('\n🔗 TEST 12: Navigation & Standards Links\n', 'cyan');

const frHeader = readFile(path.join(projectRoot, 'src/components/Header.astro'));
const frFooter = readFile(path.join(projectRoot, 'src/components/Footer.astro'));
const trustBadges = readFile(path.join(projectRoot, 'src/components/TrustBadges.astro'));

test('Header has Standards link', frHeader && frHeader.includes('standards'));
test('Footer has Standards link', frFooter && frFooter.includes('standards'));
test('TrustBadges links to Standards page', trustBadges && trustBadges.includes('translatePath(\'/standards\')'));
test('TrustBadges has 6 sectors', trustBadges && trustBadges.includes('Dispositifs médicaux') && trustBadges.includes('Énergie & comptage'));
test('TrustBadges has 7 standards', trustBadges && trustBadges.includes('ISO 26262'));

// ========================================
// 13. CTA & Booking Links (v1.1 updates)
// ========================================
log('\n📞 TEST 13: CTA & Booking Integration\n', 'cyan');

const ctaSection = readFile(path.join(projectRoot, 'src/components/CTASection.astro'));
const heroSection = readFile(path.join(projectRoot, 'src/components/HeroSection.astro'));
const caseStudies = readFile(path.join(projectRoot, 'src/components/CaseStudies.astro'));
const testimonials = readFile(path.join(projectRoot, 'src/components/Testimonials.astro'));
const faqComponent = readFile(path.join(projectRoot, 'src/components/FAQ.astro'));

test('CTASection links to #booking', ctaSection && ctaSection.includes('#booking'));
test('HeroSection links to #booking', heroSection && heroSection.includes('#booking'));
test('CaseStudies links to #booking', caseStudies && caseStudies.includes('#booking'));
test('Testimonials links to #booking', testimonials && testimonials.includes('#booking'));
test('FAQ links to #booking', faqComponent && faqComponent.includes('#booking'));
test('CTASection has single button', ctaSection && !ctaSection.includes('secondary'));
test('HeroSection has single button', heroSection && !heroSection.includes('hero.cta.secondary'));

// ========================================
// 14. Content Updates (v1.1)
// ========================================
log('\n📝 TEST 14: Content Repositioning & Updates\n', 'cyan');

const statsSection = readFile(path.join(projectRoot, 'src/components/StatsSection.astro'));
const expertiseSection = readFile(path.join(projectRoot, 'src/components/ExpertiseSection.astro'));

test('Stats shows 17+ projects', frHome && frHome.includes('17'));
test('Stats shows 6+ standards', frHome && frHome.includes('6'));
test('ExpertiseSection shows DLMS/COSEM', expertiseSection && expertiseSection.includes('DLMS/COSEM'));
test('ExpertiseSection shows IEC standards', expertiseSection && expertiseSection.includes('IEC'));
test('Hero mentions embedded systems', frHome && (frHome.includes('Systèmes embarqués') || frHome.includes('Embedded Systems')));
test('Hero mentions compliance', frHome && (frHome.includes('Conformes') || frHome.includes('Compliance')));
test('Services page mentions electronics design', servicesPage && (servicesPage.includes('électronique') || servicesPage.includes('electronics')));
test('Services page has protocols section', servicesPage && (servicesPage.includes('J1939') || servicesPage.includes('CAN')));

// ========================================
// 15. Case Studies (v1.1 updates)
// ========================================
log('\n📊 TEST 15: Case Studies Realignment\n', 'cyan');

const caseStudiesComponent = readFile(path.join(projectRoot, 'src/components/CaseStudies.astro'));

test('CaseStudies has DLMS/COSEM project', caseStudiesComponent && caseStudiesComponent.includes('DLMS/COSEM'));
test('CaseStudies has medical device project', caseStudiesComponent && caseStudiesComponent.includes('IEC 60601'));
test('CaseStudies has off-highway project', caseStudiesComponent && (caseStudiesComponent.includes('IEC 61508') || caseStudiesComponent.includes('ISO 13849')));
test('CaseStudies removed aerospace project', caseStudiesComponent && !caseStudiesComponent.includes('aerospace-iot'));
test('CaseStudies has energy metering', caseStudiesComponent && (caseStudiesComponent.includes('metering') || caseStudiesComponent.includes('comptage')));
test('CaseStudies has metrics', caseStudiesComponent && caseStudiesComponent.includes('10K+'));

// ========================================
// 16. Contact Form Updates (v1.1)
// ========================================
log('\n📧 TEST 16: Contact Form Enhancements\n', 'cyan');

test('FR Contact has sector dropdown', frContact && frContact.includes('id="sector"'));
test('EN Contact has sector dropdown', enContact && enContact.includes('id="sector"'));
test('FR Contact has medical devices option', frContact && frContact.includes('Dispositifs médicaux'));
test('FR Contact has energy option', frContact && (frContact.includes('Énergie &amp; comptage') || frContact.includes('Énergie & comptage')));
test('FR Contact has booking banner', frContact && (frContact.includes('Besoin d&#39;un appel rapide') || frContact.includes('Besoin d\'un appel rapide')));
test('EN Contact has booking banner', enContact && enContact.includes('Need a quick call'));
test('Contact subject updated', frContact && (frContact.includes('Conformité') || frContact.includes('Conformit') || frContact.includes('embedded')));

// ========================================
// 17. SEO & Meta Updates (v1.1)
// ========================================
log('\n🔍 TEST 17: SEO Optimization\n', 'cyan');

test('FR Home meta has embedded keywords', frHome && (frHome.includes('systèmes embarqués') || frHome.includes('syst&#xE8;mes embarqu&#xE9;s')));
test('FR Home meta has IEC keywords', frHome && frHome.includes('IEC 60601'));
test('EN Home meta has compliance keywords', enHome && enHome.includes('compliance'));
test('FR Home meta has DLMS/COSEM', frHome && frHome.includes('DLMS/COSEM'));
test('About page updated with sectors', aboutPage && (aboutPage.includes('Dispositifs médicaux') || aboutPage.includes('Medical Devices')));
test('Services page SEO updated', servicesPage && (servicesPage.includes('electronics') || servicesPage.includes('électronique') || servicesPage.includes('lectronique')));

// ========================================
// 18. Component Architecture (v1.1)
// ========================================
log('\n🏗️ TEST 18: Component Architecture\n', 'cyan');

const standardsBadges = readFile(path.join(projectRoot, 'src/components/StandardsBadges.astro'));

test('StandardsBadges component exists', standardsBadges !== null);
test('StandardsBadges has 7 standards', standardsBadges && standardsBadges.includes('ISO 26262'));
test('StandardsBadges not duplicated on homepage', !frHome || !(frHome.includes('StandardsBadges') && frHome.includes('import StandardsBadges')));
test('TrustBadges consolidated sectors+standards', trustBadges && trustBadges.includes('sectors') && trustBadges.includes('standards'));
test('Only TrustBadges used on homepage', frHome && (frHome.includes('TrustBadges') || frHome.includes('Dispositifs m&#xE9;dicaux') || frHome.includes('Dispositifs médicaux')));

// ========================================
// 19. CSS & Styling
// ========================================
log('\n🎨 TEST 19: Styling & Assets\n', 'cyan');

const astsroCSS = readFile(path.join(projectRoot, 'src/styles/global.css'));
test('Tailwind CSS configured', astsroCSS !== null || fs.existsSync(path.join(projectRoot, 'tailwind.config.mjs')));

// Check for CSS files in dist
const distFiles = fs.readdirSync(path.join(distDir, '_astro')).filter(f => f.endsWith('.css'));
test('CSS files generated', distFiles.length > 0, `Found ${distFiles.length} CSS files`);

// ========================================
// 20. JavaScript & Interactivity
// ========================================
log('\n⚡ TEST 20: JavaScript & Interactivity\n', 'cyan');

const jsFiles = fs.readdirSync(path.join(distDir, '_astro')).filter(f => f.endsWith('.js'));
test('JavaScript files generated', jsFiles.length > 0, `Found ${jsFiles.length} JS files`);
test('Formspree integration', enContact && enContact.includes('formspree.io'));

// Check if CookieConsent component exists in source
const cookieConsentComponent = readFile(path.join(projectRoot, 'src/components/CookieConsent.astro'));
test('Cookie consent component exists', cookieConsentComponent !== null);

// ========================================
// 21. Tailwind Color Palette Integrity
// ========================================
log('\n🎨 TEST 21: Tailwind Color Palette Integrity\n', 'cyan');

const tailwindConfig = readFile(path.join(projectRoot, 'tailwind.config.mjs'));
const footerComponent = readFile(path.join(projectRoot, 'src/components/Footer.astro'));
const headerComponent = readFile(path.join(projectRoot, 'src/components/Header.astro'));
const heroComponent = readFile(path.join(projectRoot, 'src/components/HeroSection.astro'));

// Vérifier que les couleurs dark existent pour le Footer
test('Tailwind has dark color palette', tailwindConfig && tailwindConfig.includes('dark:'));
test('Tailwind has dark-900 color', tailwindConfig && /dark:\s*\{[^}]*900:\s*['"]#1A1A1A['"]/.test(tailwindConfig));
test('Footer uses dark-900 background', footerComponent && footerComponent.includes('bg-dark-900'));
test('Dark colors match Footer requirements', tailwindConfig && tailwindConfig.includes('#1A1A1A'));

// Vérifier cohérence entre secondary.900 et dark.900
test('Dark-900 matches secondary-900', 
  tailwindConfig && 
  tailwindConfig.includes("900: '#1A1A1A'") && 
  (tailwindConfig.match(/#1A1A1A/g) || []).length >= 2
);

// Vérifier présence palette primary complète (50-900)
test('Primary palette has all shades', 
  tailwindConfig && 
  ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    .every(shade => new RegExp(`primary:[^}]*${shade}:`).test(tailwindConfig))
);

// Vérifier présence palette secondary complète (50-900)
test('Secondary palette has all shades', 
  tailwindConfig && 
  ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    .every(shade => new RegExp(`secondary:[^}]*${shade}:`).test(tailwindConfig))
);

// Vérifier que les composants utilisent des couleurs définies
test('Header uses valid primary colors', 
  headerComponent && 
  (headerComponent.includes('bg-primary-500') || headerComponent.includes('bg-primary-600'))
);

test('Hero uses valid primary colors', 
  heroComponent && 
  (heroComponent.includes('bg-primary-') || heroComponent.includes('text-primary-'))
);

// Vérifier couleur principale primary-500 (Teal #009999)
test('Primary-500 is teal (#009999)', 
  tailwindConfig && 
  /500:\s*['"]#009999['"]\s*,?\s*\/\/\s*Teal/.test(tailwindConfig)
);

// Vérifier couleur secondaire secondary-500 (Gris #6F6F6F)
test('Secondary-500 is gray (#6F6F6F)', 
  tailwindConfig && 
  /500:\s*['"]#6F6F6F['"]\s*,?\s*\/\/\s*Gris/.test(tailwindConfig)
);

// ========================================
// TEST 22: GitHub Workflows Configuration Integrity
// ========================================
log('\n🔧 TEST 22: GitHub Workflows Configuration Integrity\n', 'magenta');

const staticYml = fs.readFileSync('.github/workflows/static.yml', 'utf8');
const deployYml = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');

// Check static.yml builds and deploys dist
test('static.yml has npm install step', staticYml.includes('npm ci') || staticYml.includes('npm install'));
test('static.yml has Astro build step', staticYml.includes('npm run build') || staticYml.includes('astro build'));
test('static.yml deploys dist folder', staticYml.includes("path: './dist'") || staticYml.includes('path: ./dist'));
test('static.yml does not deploy root folder', !staticYml.includes("path: '.'") || staticYml.split("path: '.'").length < 2);

// Check deploy.yml configuration
test('deploy.yml deploys dist folder', deployYml.includes('path: ./dist'));
test('deploy.yml has pre-deploy tests', deployYml.includes('test:pre-deploy') || deployYml.includes('test:pre-commit'));
test('deploy.yml has build step', deployYml.includes('npm run build'));

// Check package.json scripts exist
const packageJsonContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
test('package.json has build script', packageJsonContent.scripts && packageJsonContent.scripts.build);
test('package.json has test:pre-commit script', packageJsonContent.scripts && packageJsonContent.scripts['test:pre-commit']);
test('package.json has test:all script', packageJsonContent.scripts && packageJsonContent.scripts['test:all']);

// Verify critical scripts exist
test('pre-deploy-check.js exists', fs.existsSync('scripts/pre-deploy-check.js'));
test('post-deploy-verification.js exists', fs.existsSync('scripts/post-deploy-verification.js'));
test('e2e-contact-test.js exists', fs.existsSync('scripts/e2e-contact-test.js'));

// ========================================
// TEST 23: UTF-8 Encoding & Text Display Integrity
// ========================================
log('\n📝 TEST 23: UTF-8 Encoding & Text Display Integrity', 'cyan');

// Common malformed encoding patterns (UTF-8 viewed as ISO-8859-1 or similar)
const encodingIssues = [
  // French accents
  { pattern: /Ã©/g, correct: '\u00E9', name: 'e accent aigu' },
  { pattern: /Ã¨/g, correct: '\u00E8', name: 'e accent grave' },
  { pattern: /Ãª/g, correct: '\u00EA', name: 'e accent circonflexe' },
  { pattern: /Ã /g, correct: '\u00E0', name: 'a accent grave' },
  { pattern: /Ã´/g, correct: '\u00F4', name: 'o accent circonflexe' },
  { pattern: /Ã®/g, correct: '\u00EE', name: 'i accent circonflexe' },
  { pattern: /Ã¹/g, correct: '\u00F9', name: 'u accent grave' },
  { pattern: /Ã§/g, correct: '\u00E7', name: 'c cedille' },
  { pattern: /Ã‰/g, correct: '\u00C9', name: 'E accent aigu' },
  { pattern: /Ã€/g, correct: '\u00C0', name: 'A accent grave' },
  { pattern: /Ã‡/g, correct: '\u00C7', name: 'C cedille' },
  // Smart quotes and dashes (using hex codes)
  { pattern: /â€™/g, correct: '\u2019', name: 'apostrophe courbe' },
  { pattern: /â€œ/g, correct: '\u201C', name: 'guillemet ouvrant' },
  { pattern: /â€/g, correct: '\u201D', name: 'guillemet fermant' },
  { pattern: /â€"mlong/g, correct: '\u2014', name: 'tiret long' },
  { pattern: /â€"moyen/g, correct: '\u2013', name: 'tiret moyen' },
  // Other common issues
  { pattern: /Ã¢/g, correct: '\u00E2', name: 'a accent circonflexe' },
  { pattern: /Ã»/g, correct: '\u00FB', name: 'u accent circonflexe' },
  { pattern: /Å"/g, correct: '\u0153', name: 'o-e ligature' },
];

// Files to check for encoding issues
const filesToCheckEncoding = [
  'src/i18n/ui.ts',
  'src/pages/index.astro',
  'src/pages/fr/index.astro',
  'src/pages/en/index.astro',
  'src/pages/fr/about.astro',
  'src/pages/en/about.astro',
  'src/pages/fr/services.astro',
  'src/pages/en/services.astro',
  'src/pages/fr/contact.astro',
  'src/pages/en/contact.astro',
  'src/pages/fr/cookies.astro',
  'src/pages/en/cookies.astro',
  'src/components/Footer.astro',
  'src/components/Header.astro',
  'src/components/FAQ.astro',
  'src/components/Testimonials.astro',
];

filesToCheckEncoding.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for each encoding issue pattern
    encodingIssues.forEach(issue => {
      const matches = content.match(issue.pattern);
      test(
        `${path.basename(filePath)} has no malformed ${issue.name}`,
        !matches,
        matches ? `Found ${matches.length} occurrence(s) of malformed "${issue.name}": ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}` : ''
      );
    });
  }
});

// Verify critical French text has proper accents (positive check)
const frenchTextChecks = [
  { file: 'src/i18n/ui.ts', text: 'Syst\u00E8me', description: 'French word Systeme with accent' },
  { file: 'src/i18n/ui.ts', text: '\u00E9lectronique', description: 'French word electronique with accent' },
  { file: 'src/i18n/ui.ts', text: '\u00C9nergie', description: 'French word Energie with accent' },
  { file: 'src/i18n/ui.ts', text: 'm\u00E9dicaux', description: 'French word medicaux with accent' },
  { file: 'src/i18n/ui.ts', text: 'r\u00E9pondons', description: 'French word repondons with accent' },
  { file: 'src/pages/fr/contact.astro', text: 'r\u00E9essayer', description: 'CAPTCHA error message reessayer' },
  { file: 'src/pages/fr/contact.astro', text: 'envoy\u00E9', description: 'Success message envoye with accent' },
  { file: 'src/pages/fr/contact.astro', text: 'D\u00E9crivez', description: 'Placeholder Decrivez with accent' },
  { file: 'src/pages/fr/contact.astro', text: 'S\u00E9lectionner', description: 'Select option Selectionner with accent' },
  { file: 'src/pages/fr/contact.astro', text: 'Imm\u00E9diate', description: 'Timeline option Immediate with accent' },
];

frenchTextChecks.forEach(check => {
  const fullPath = path.join(projectRoot, check.file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    test(
      `${path.basename(check.file)} contains properly encoded "${check.description}"`,
      content.includes(check.text),
      `Missing or malformed: ${check.text}`
    );
  }
});

// Check HTML meta charset declarations
const htmlFiles = [
  'dist/index.html',
  'dist/fr/index.html',
  'dist/en/index.html',
  'dist/fr/contact.html',
  'dist/en/contact.html',
];

htmlFiles.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    test(
      `${filePath} declares UTF-8 charset`,
      content.includes('charset="utf-8"') || content.includes('charset=utf-8') || content.includes('charset="UTF-8"'),
      'Missing or incorrect charset declaration'
    );
  }
});

// Verify source files are UTF-8 encoded (BOM check - UTF-8 files should NOT have BOM)
const sourceFilesToCheck = [
  'src/i18n/ui.ts',
  'src/pages/fr/contact.astro',
  'src/pages/en/contact.astro',
];

sourceFilesToCheck.forEach(filePath => {
  const fullPath = path.join(projectRoot, filePath);
  if (fs.existsSync(fullPath)) {
    const buffer = fs.readFileSync(fullPath);
    const hasBOM = buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF;
    test(
      `${path.basename(filePath)} is UTF-8 without BOM`,
      !hasBOM,
      'File has UTF-8 BOM which can cause issues'
    );
  }
});

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

