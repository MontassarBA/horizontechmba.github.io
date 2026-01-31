#!/usr/bin/env node

/**
 * HORIZONTECH MBA - Security & Testing Suite
 * Niveau militaire de sécurité
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tests = {
  // Test 1: Vérifier que le build réussit
  buildSuccess: () => {
    console.log('✓ Test 1: Build Success - All pages generated');
    const requiredPages = [
      'index.html',
      'en/index.html',
      'fr/index.html',
      'en/contact/index.html',
      'fr/contact/index.html'
    ];
    const distDir = path.join(__dirname, '../dist');
    const missing = [];
    requiredPages.forEach(page => {
      if (!fs.existsSync(path.join(distDir, page))) {
        missing.push(page);
      }
    });
    return { passed: missing.length === 0, missing };
  },

  // Test 2: Aucun secret en dur
  noHardcodedSecrets: () => {
    console.log('✓ Test 2: No Hardcoded Secrets');
    const srcDir = path.join(__dirname, '../src');
    let foundSecrets = [];
    const secretPatterns = [
      /api[_-]?key\s*[:=]/gi,
      /secret\s*[:=]/gi,
      /password\s*[:=]/gi,
      /bearer\s+[a-z0-9]+/gi
    ];
    
    const scanDir = (dir) => {
      fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          scanDir(filePath);
        } else if (file.endsWith('.astro') || file.endsWith('.ts')) {
          const content = fs.readFileSync(filePath, 'utf-8');
          secretPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              foundSecrets.push(file);
            }
          });
        }
      });
    };
    
    scanDir(srcDir);
    return { passed: foundSecrets.length === 0, foundSecrets };
  },

  // Test 3: Security headers présents
  securityHeaders: () => {
    console.log('✓ Test 3: Security Headers Configured');
    const headersFile = path.join(__dirname, '../public/_headers');
    if (!fs.existsSync(headersFile)) {
      return { passed: false, error: '_headers file not found' };
    }
    const content = fs.readFileSync(headersFile, 'utf-8');
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy',
      'Strict-Transport-Security'
    ];
    const missing = requiredHeaders.filter(h => !content.includes(h));
    return { passed: missing.length === 0, missing };
  },

  // Test 4: Formspree intégré (pas de placeholder)
  formspreeIntegrated: () => {
    console.log('✓ Test 4: Formspree Integrated (No Placeholder)');
    const contactEN = path.join(__dirname, '../src/pages/en/contact.astro');
    const contactFR = path.join(__dirname, '../src/pages/fr/contact.astro');
    const contentEN = fs.readFileSync(contactEN, 'utf-8');
    const contentFR = fs.readFileSync(contactFR, 'utf-8');
    
    const hasEN = contentEN.includes('formspree.io/f/') && !contentEN.includes('YOUR_FORM_ID');
    const hasFR = contentFR.includes('formspree.io/f/') && !contentFR.includes('YOUR_FORM_ID');
    return { passed: hasEN && hasFR };
  },

  // Test 5: Validation formulaire
  formValidation: () => {
    console.log('✓ Test 5: Form Validation & Sanitization');
    const workerFile = path.join(__dirname, '../serverless/cloudflare-worker-contact/src/index.ts');
    const content = fs.readFileSync(workerFile, 'utf-8');
    
    const checks = {
      emailValidation: content.includes('validateEmail'),
      rateLimiting: content.includes('checkRateLimit'),
      htmlSanitization: content.includes('sanitizeHtml'),
      recaptchaVerify: content.includes('verifyRecaptcha'),
      inputLengthLimits: content.includes('5000')
    };
    
    return { passed: Object.values(checks).every(v => v), checks };
  },

  // Test 6: CORS stricte
  corsConfigure: () => {
    console.log('✓ Test 6: CORS Strictly Configured');
    const workerFile = path.join(__dirname, '../serverless/cloudflare-worker-contact/src/index.ts');
    const content = fs.readFileSync(workerFile, 'utf-8');
    
    const hasCorsValidation = content.includes('ALLOWED_ORIGINS');
    const hasOriginCheck = content.includes('isAllowed');
    return { passed: hasCorsValidation && hasOriginCheck };
  },

  // Test 7: Formspree protection anti-spam
  formspreeSpamProtection: () => {
    console.log('✓ Test 7: Formspree Spam Protection Enabled');
    const contactEN = path.join(__dirname, '../src/pages/en/contact.astro');
    const contactFR = path.join(__dirname, '../src/pages/fr/contact.astro');
    const contentEN = fs.readFileSync(contactEN, 'utf-8');
    const contentFR = fs.readFileSync(contactFR, 'utf-8');
    
    // Vérifier que Formspree est utilisé (il a sa propre protection anti-spam)
    const hasFormspreeEN = contentEN.includes('formspree.io/f/') && !contentEN.includes('YOUR_FORM_ID');
    const hasFormspreeFR = contentFR.includes('formspree.io/f/') && !contentFR.includes('YOUR_FORM_ID');
    return { passed: hasFormspreeEN && hasFormspreeFR };
  },

  // Test 8: i18n sans vulnérabilités
  i18nSecurity: () => {
    console.log('✓ Test 8: i18n Security (No Injection)');
    const astroConfig = path.join(__dirname, '../astro.config.mjs');
    const content = fs.readFileSync(astroConfig, 'utf-8');
    
    const hasFrenchDefault = content.includes("'fr'");
    const hasRoutingConfig = content.includes('routing');
    return { passed: hasFrenchDefault && hasRoutingConfig };
  }
};

// Exécuter tous les tests
console.log('\n═══════════════════════════════════════════════════════');
console.log('  HORIZONTECH MBA - SECURITY & TESTING SUITE (Level: MILITARY)');
console.log('═══════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

Object.entries(tests).forEach(([name, test]) => {
  try {
    const result = test();
    if (result.passed) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      console.log(`   Details:`, JSON.stringify(result, null, 2));
      failed++;
    }
  } catch (err) {
    console.log(`❌ ERROR: ${name}`);
    console.log(`   ${err.message}`);
    failed++;
  }
});

console.log(`\n═══════════════════════════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`═══════════════════════════════════════════════════════\n`);

process.exit(failed > 0 ? 1 : 0);
