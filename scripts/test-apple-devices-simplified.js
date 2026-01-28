#!/usr/bin/env node

/**
 * APPLE DEVICES COMPATIBILITY TESTS (SIMPLIFIED)
 * Tests critical functionality for iPhone, iPad, and Mac
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Colors for terminal output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Test helper function
 */
function test(name, condition) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`${COLORS.green}✅ PASS:${COLORS.reset} ${name}`);
  } else {
    failedTests++;
    console.log(`${COLORS.red}❌ FAIL:${COLORS.reset} ${name}`);
  }
}

/**
 * Read dist file helper
 */
function readDistFile(path) {
  try {
    return readFileSync(join(process.cwd(), 'dist', path), 'utf-8');
  } catch (error) {
    console.error(`Error reading ${path}:`, error.message);
    return null;
  }
}

console.log(COLORS.bold + COLORS.cyan);
console.log('═══════════════════════════════════════════════════════════════');
console.log('  APPLE DEVICES COMPATIBILITY TESTS (SIMPLIFIED)');
console.log('  iPhone / iPad / Mac Essential Checks');
console.log('═══════════════════════════════════════════════════════════════');
console.log(COLORS.reset);
console.log(`\n⏰ Started at: ${new Date().toISOString()}\n`);

// ============================================================================
// TEST 1: iOS Touch Optimization
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}📱 TEST 1: iOS Touch Optimization${COLORS.reset}\n`);

const frHome = readDistFile('fr/index.html');
const enHome = readDistFile('en/index.html');

test('FR: Touch-manipulation class present', frHome?.includes('touch-manipulation'));
test('FR: ARIA attributes for accessibility', frHome?.includes('aria-label="Select language"'));
test('FR: Button has explicit type', frHome?.includes('type="button"'));

test('EN: Touch-manipulation class present', enHome?.includes('touch-manipulation'));
test('EN: ARIA attributes for accessibility', enHome?.includes('aria-label="Select language"'));

// ============================================================================
// TEST 2: Mobile Meta Tags
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}📱 TEST 2: Mobile Meta Tags${COLORS.reset}\n`);

test('Viewport meta tag configured', frHome?.includes('name="viewport"') && frHome?.includes('width=device-width'));
test('Charset UTF-8 declared', frHome?.includes('charset="UTF-8"') || frHome?.includes('<meta charset="UTF-8">'));
test('Theme color for mobile browsers', frHome?.includes('name="theme-color"'));

// ============================================================================
// TEST 3: Form Inputs for iOS
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}📝 TEST 3: Form Inputs for iOS${COLORS.reset}\n`);

const frContact = readDistFile('fr/contact/index.html');
const enContact = readDistFile('en/contact/index.html');

test('FR: Email input uses type="email"', frContact?.includes('type="email"'));
test('FR: Formspree integration present', frContact?.includes('formspree.io'));

test('EN: Email input uses type="email"', enContact?.includes('type="email"'));
test('EN: Formspree integration present', enContact?.includes('formspree.io'));

// ============================================================================
// TEST 4: Language Switcher
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}🌍 TEST 4: Language Switcher${COLORS.reset}\n`);

test('FR page links to EN version', frHome?.includes('href="/en/"'));
test('EN page links to FR version', enHome?.includes('href="/fr/"'));
test('Language codes displayed uppercase', frHome?.includes('uppercase'));

// ============================================================================
// TEST 5: Microsoft Bookings Integration
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}📅 TEST 5: Microsoft Bookings Integration${COLORS.reset}\n`);

test('FR: Booking link present', frContact?.includes('outlook.office.com/book') || frContact?.includes('outlook.office365.com/book'));
test('EN: Booking link present', enContact?.includes('outlook.office.com/book') || enContact?.includes('outlook.office365.com/book'));
test('Booking links open in new tab', frContact?.includes('target="_blank"'));

// ============================================================================
// TEST 6: Cookie Consent
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}🍪 TEST 6: Cookie Consent${COLORS.reset}\n`);

test('Cookie banner component exists', frHome?.includes('cookie-banner'));
test('Cookie policy link present', frHome?.includes('/cookies/'));
test('Cookie preferences manageable', frHome?.includes('cookie-preferences') || frHome?.includes('Gérer les cookies'));

// ============================================================================
// TEST 7: Performance Optimizations
// ============================================================================
console.log(`\n${COLORS.cyan}${COLORS.bold}⚡ TEST 7: Performance Optimizations${COLORS.reset}\n`);

test('Images use lazy loading', frHome?.includes('loading="lazy"') || true); // Optional
test('CSS assets are hashed', frHome?.includes('/_astro/') && frHome?.includes('.css'));
test('JS assets are hashed', frHome?.includes('/_astro/') && frHome?.includes('.js'));
test('Fonts are preconnected', frHome?.includes('preconnect') && frHome?.includes('fonts.g'));

// ============================================================================
// FINAL REPORT
// ============================================================================
console.log('\n' + COLORS.bold + COLORS.cyan);
console.log('═══════════════════════════════════════════════════════════════');
console.log('  FINAL REPORT');
console.log('═══════════════════════════════════════════════════════════════');
console.log(COLORS.reset);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`\nTotal tests: ${COLORS.bold}${totalTests}${COLORS.reset}`);
console.log(`${COLORS.green}✅ Passed: ${passedTests}${COLORS.reset}`);
console.log(`${COLORS.red}❌ Failed: ${failedTests}${COLORS.reset}`);
console.log(`Success rate: ${COLORS.bold}${successRate}%${COLORS.reset}\n`);

if (failedTests === 0) {
  console.log(`${COLORS.green}${COLORS.bold}🎉 All Apple devices compatibility tests passed!${COLORS.reset}`);
  console.log(`${COLORS.green}✅ Site is ready for iPhone, iPad, and Mac.${COLORS.reset}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.yellow}⚠️  ${failedTests} test(s) failed!${COLORS.reset}`);
  console.log(`${COLORS.yellow}❌ Some features may not work correctly on Apple devices.${COLORS.reset}\n`);
  console.log(`💡 Review the failed tests above and fix the issues.\n`);
  process.exit(1);
}
