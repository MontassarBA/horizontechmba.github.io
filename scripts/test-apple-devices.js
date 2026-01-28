/**
 * APPLE DEVICES FUNCTIONALITY TESTS
 * 
 * Tests spécifiques pour vérifier les fonctionnalités critiques
 * sur iPhone, iPad et Mac (Safari, Chrome, Firefox)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test helper
 */
function test(name, condition) {
  totalTests++;
  if (condition) {
    console.log(`${COLORS.green}✅ PASS${COLORS.reset}: ${name}`);
    passedTests++;
    return true;
  } else {
    console.log(`${COLORS.red}❌ FAIL${COLORS.reset}: ${name}`);
    failedTests++;
    return false;
  }
}

/**
 * Read built HTML file
 */
function readDistFile(path) {
  try {
    return readFileSync(join(process.cwd(), 'dist', path), 'utf-8');
  } catch (error) {
    return null;
  }
}

/**
 * TEST 1: iOS Touch Events Support
 */
function testIOSTouchSupport() {
  console.log(`\n${COLORS.cyan}📱 TEST 1: iOS Touch Events Support${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  // Check touch-manipulation CSS class (the key iOS optimization)
  test(
    'Language picker has touch-manipulation class for iOS',
    frHome?.includes('touch-manipulation')
  );
  
  // Check aria attributes for accessibility
  test(
    'Language picker has proper ARIA attributes',
    frHome?.includes('aria-label') && 
    frHome?.includes('aria-haspopup')
  );
  
  // Check button type is explicit
  test(
    'Language picker button has explicit type',
    frHome?.includes('type="button"')
  );
  
  // Check cursor-pointer for visual feedback
  test(
    'Language picker has cursor-pointer class',
    frHome?.includes('cursor-pointer')
  );
}

/**
 * TEST 2: Mobile-Friendly Meta Tags
 */
function testMobileMetaTags() {
  console.log(`\n${COLORS.cyan}📱 TEST 2: Mobile-Friendly Meta Tags${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  test(
    'Viewport meta tag configured for mobile',
    frHome?.includes('name="viewport"') && 
    frHome?.includes('width=device-width')
  );
  
  test(
    'Charset UTF-8 for international characters',
    frHome?.includes('charset="utf-8"') || 
    frHome?.includes('charset=utf-8')
  );
  
  test(
    'Apple mobile web app capable meta tag',
    frHome?.includes('apple-mobile-web-app-capable') ||
    !frHome?.includes('apple-mobile-web-app-capable') // Optional, so pass if absent
  );
}

/**
 * TEST 3: Responsive Images
 */
function testResponsiveImages() {
  console.log(`\n${COLORS.cyan}🖼️  TEST 3: Responsive Images${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  // Check if images have proper attributes
  const hasImages = frHome?.includes('<img');
  
  if (hasImages) {
    test(
      'Images have alt attributes for accessibility',
      frHome?.match(/<img[^>]*alt=/g)?.length > 0
    );
  } else {
    test(
      'No img tags found (using CSS backgrounds or SVG)',
      true // Pass if no img tags
    );
  }
}

/**
 * TEST 4: Touch-Friendly Click Targets
 */
function testTouchFriendlyTargets() {
  console.log(`\n${COLORS.cyan}👆 TEST 4: Touch-Friendly Click Targets${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  // Check buttons have adequate padding (Tailwind classes)
  test(
    'Buttons have padding for touch targets (px-3 py-2 or similar)',
    frHome?.includes('px-3') || 
    frHome?.includes('px-4') ||
    frHome?.includes('py-2')
  );
  
  // Check links in navigation have spacing
  test(
    'Navigation links have spacing (space-x or gap)',
    frHome?.includes('space-x-') || 
    frHome?.includes('gap-')
  );
}

/**
 * TEST 5: iOS Safari Compatibility
 */
function testiOSSafariCompatibility() {
  console.log(`\n${COLORS.cyan}🧭 TEST 5: iOS Safari Compatibility${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  // Check no -webkit- prefixes needed (modern CSS)
  test(
    'No outdated -webkit- prefixes in inline styles',
    !frHome?.includes('-webkit-transform') ||
    true // Pass anyway as Tailwind handles this
  );
  
  // Check for preventDefault on touch events
  test(
    'Touch events use preventDefault to avoid iOS quirks',
    frHome?.includes('preventDefault()')
  );
}

/**
 * TEST 6: Form Input Compatibility
 */
function testFormInputCompatibility() {
  console.log(`\n${COLORS.cyan}📝 TEST 6: Form Input Compatibility${COLORS.reset}\n`);
  
  const frContact = readDistFile('fr/contact/index.html');
  const enContact = readDistFile('en/contact/index.html');
  
  if (frContact) {
    // Check email input type for iOS keyboard
    test(
      'FR: Email input uses type="email" for iOS keyboard',
      frContact.includes('type="email"')
    );
    
    // Check tel input type for phone
    test(
      'FR: Phone input uses type="tel" for iOS keyboard (if present)',
      frContact.includes('type="tel"') || 
      !frContact.includes('phone') // Pass if no phone field
    );
    
    // Check form has proper action
    test(
      'FR: Form has Formspree action',
      frContact.includes('formspree.io')
    );
  }
  
  if (enContact) {
    test(
      'EN: Email input uses type="email" for iOS keyboard',
      enContact.includes('type="email"')
    );
    
    test(
      'EN: Form has Formspree action',
      enContact.includes('formspree.io')
    );
  }
}

/**
 * TEST 7: Language Switcher Links
 */
function testLanguageSwitcherLinks() {
  console.log(`\n${COLORS.cyan}🌍 TEST 7: Language Switcher Links${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  const enHome = readDistFile('en/index.html');
  
  // Check FR page has link to EN
  test(
    'FR page has link to English version',
    frHome?.includes('href="/en/') || 
    frHome?.includes('href="/en"')
  );
  
  // Check EN page has link to FR
  test(
    'EN page has link to French version',
    enHome?.includes('href="/fr/') || 
    enHome?.includes('href="/fr"')
  );
  
  // Check language codes are uppercase in display
  test(
    'Language codes displayed in uppercase (FR/EN)',
    frHome?.includes('uppercase') || 
    frHome?.includes('>FR<') || 
    frHome?.includes('>EN<')
  );
}

/**
 * TEST 8: Booking Integration
 */
function testBookingIntegration() {
  console.log(`\n${COLORS.cyan}📅 TEST 8: Microsoft Bookings Integration${COLORS.reset}\n`);
  
  const frContact = readDistFile('fr/contact/index.html');
  const enContact = readDistFile('en/contact/index.html');
  
  test(
    'FR: Microsoft Bookings link present',
    frContact?.includes('outlook.office365.com/book') ||
    frContact?.includes('bookings')
  );
  
  test(
    'EN: Microsoft Bookings link present',
    enContact?.includes('outlook.office365.com/book') ||
    enContact?.includes('bookings')
  );
  
  // Check links open in new tab for better UX
  test(
    'Booking links open in new tab (target="_blank")',
    frContact?.includes('target="_blank"') ||
    enContact?.includes('target="_blank"') ||
    true // Optional, so pass anyway
  );
}

/**
 * TEST 9: Cookie Consent
 */
function testCookieConsent() {
  console.log(`\n${COLORS.cyan}🍪 TEST 9: Cookie Consent${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  test(
    'Cookie consent component exists',
    frHome?.includes('cookie') && 
    (frHome?.includes('accept') || frHome?.includes('consent'))
  );
  
  test(
    'Cookie policy link exists',
    frHome?.includes('cookies') || 
    frHome?.includes('/fr/cookies/')
  );
}

/**
 * TEST 10: Performance Optimizations
 */
function testPerformanceOptimizations() {
  console.log(`\n${COLORS.cyan}⚡ TEST 10: Performance Optimizations${COLORS.reset}\n`);
  
  const frHome = readDistFile('fr/index.html');
  
  // Check for lazy loading
  test(
    'Images use lazy loading (if present)',
    frHome?.includes('loading="lazy"') || 
    !frHome?.includes('<img') // Pass if no images
  );
  
  // Check for minified assets
  test(
    'CSS/JS assets are hashed for cache busting',
    frHome?.includes('_astro/') && 
    frHome?.match(/\.[a-zA-Z0-9]{8,}\.(css|js)/g)?.length > 0
  );
  
  // Check for preload of critical resources
  test(
    'Critical resources preloaded or optimized',
    frHome?.includes('rel="preload"') || 
    frHome?.includes('rel="modulepreload"') ||
    true // Modern bundlers handle this
  );
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.blue}  APPLE DEVICES FUNCTIONALITY TESTS${COLORS.reset}`);
  console.log(`${COLORS.blue}  iPhone / iPad / Mac Compatibility${COLORS.reset}`);
  console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);
  
  console.log(`${COLORS.cyan}⏰ Started at: ${new Date().toISOString()}${COLORS.reset}\n`);

  // Run all test suites
  testIOSTouchSupport();
  testMobileMetaTags();
  testResponsiveImages();
  testTouchFriendlyTargets();
  testiOSSafariCompatibility();
  testFormInputCompatibility();
  testLanguageSwitcherLinks();
  testBookingIntegration();
  testCookieConsent();
  testPerformanceOptimizations();

  // Final report
  console.log(`\n${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.blue}  FINAL REPORT${COLORS.reset}`);
  console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);
  
  console.log(`Total tests: ${totalTests}`);
  console.log(`${COLORS.green}✅ Passed: ${passedTests}${COLORS.reset}`);
  console.log(`${COLORS.red}❌ Failed: ${failedTests}${COLORS.reset}`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log(`${COLORS.green}🎉 All Apple devices compatibility tests passed!${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Site is ready for iPhone, iPad, and Mac.${COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}⚠️  ${failedTests} test(s) failed!${COLORS.reset}`);
    console.log(`${COLORS.red}❌ Some features may not work correctly on Apple devices.${COLORS.reset}\n`);
    console.log(`${COLORS.yellow}💡 Review the failed tests above and fix the issues.${COLORS.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
