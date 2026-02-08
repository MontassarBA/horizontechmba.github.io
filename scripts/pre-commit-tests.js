#!/usr/bin/env node

/**
 * HORIZONTECH MBA - Pre-Commit Testing Suite
 * Tests automatiques avant commit pour éviter les régressions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      cwd: projectRoot, 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

// ============================================
// TESTS DE VÉRIFICATION
// ============================================

let totalTests = 0;
let passedTests = 0;
const errors = [];

function test(name, condition, errorMsg = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    log(`  ✓ ${name}`, 'green');
  } else {
    log(`  ✗ ${name}`, 'red');
    if (errorMsg) errors.push(errorMsg);
  }
}

// ============================================
// 1. VÉRIFICATION DES FICHIERS SOURCES
// ============================================
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('🔍 PHASE 1: Vérification des fichiers sources', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

// Vérifier les fichiers critiques
const criticalFiles = [
  'src/layouts/Layout.astro',
  'src/pages/index.astro',
  'src/pages/fr/index.astro',
  'src/pages/en/index.astro',
  'astro.config.mjs',
  'package.json',
];

criticalFiles.forEach(file => {
  const exists = fs.existsSync(path.join(projectRoot, file));
  test(`Fichier critique existe: ${file}`, exists, `Fichier manquant: ${file}`);
});

// Vérifier la syntaxe JavaScript/TypeScript des fichiers modifiés
log('\n📝 Vérification de la syntaxe des fichiers...\n');
const stagedFilesResult = execCommand('git diff --cached --name-only', { silent: true });
if (stagedFilesResult.success && stagedFilesResult.output) {
  const files = stagedFilesResult.output.split('\n').filter(f => f.match(/\.(js|ts|astro|mjs)$/));
  
  files.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Vérifier Layout.astro spécifiquement pour l'erreur de script
      if (file.includes('Layout.astro')) {
        const hasProperScriptTag = content.includes('set:html=') || !content.includes('is:inline');
        test(`Layout.astro: Balises script correctes`, hasProperScriptTag, 
          'Layout.astro contient une structure de script invalide');
        
        // Vérifier que contactApiUrl est bien injecté
        const hasContactApiUrl = content.includes('window.CONTACT_API_URL');
        test(`Layout.astro: Variable CONTACT_API_URL présente`, hasContactApiUrl,
          'Variable CONTACT_API_URL manquante dans Layout.astro');
          
        // Vérifier qu'il n'y a pas de JSON.stringify dans un script inline
        const hasJsonStringifyError = content.includes('JSON.stringify') && content.includes('is:inline');
        test(`Layout.astro: Pas de JSON.stringify dans script inline`, !hasJsonStringifyError,
          'JSON.stringify trouvé dans un script is:inline (erreur de syntaxe)');
      }
      
      // Vérifier les erreurs de syntaxe communes (skip pour functionality-tests.js qui contient des regex complexes)
      if (!file.includes('functionality-tests.js')) {
        const hasMismatchedBraces = (content.match(/{/g) || []).length !== (content.match(/}/g) || []).length;
        test(`${file}: Accolades équilibrées`, !hasMismatchedBraces, 
          `Accolades non équilibrées dans ${file}`);
      }
    }
  });
}

// ============================================
// 2. BUILD DU PROJET
// ============================================
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('🏗️  PHASE 2: Build du projet', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

log('Building le projet...\n', 'yellow');
const buildResult = execCommand('npm run build', { silent: false });
const buildSuccess = buildResult.success;

test('Build réussi', buildSuccess, 'Le build a échoué - vérifiez les erreurs ci-dessus');

if (!buildSuccess) {
  log('\n❌ Le build a échoué. Commit annulé.', 'red');
  process.exit(1);
}

// ============================================
// 3. VÉRIFICATION DES FICHIERS GÉNÉRÉS
// ============================================
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('📦 PHASE 3: Vérification des fichiers générés', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

const distDir = path.join(projectRoot, 'dist');
const expectedPages = [
  'index.html',
  'fr/index.html',
  'en/index.html',
  'fr/about/index.html',
  'en/about/index.html',
  'fr/services/index.html',
  'en/services/index.html',
  'fr/contact/index.html',
  'en/contact/index.html',
  'fr/faq/index.html',
  'en/faq/index.html',
  '404.html',
];

expectedPages.forEach(page => {
  const exists = fs.existsSync(path.join(distDir, page));
  test(`Page générée: ${page}`, exists, `Page manquante: ${page}`);
});

// ============================================
// 4. VÉRIFICATION DU CONTENU CRITIQUE
// ============================================
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('🔬 PHASE 4: Vérification du contenu critique', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

// Vérifier que CONTACT_API_URL est correctement injecté
const indexFr = fs.readFileSync(path.join(distDir, 'fr/index.html'), 'utf-8');
const indexEn = fs.readFileSync(path.join(distDir, 'en/index.html'), 'utf-8');

// Vérifier que la variable est définie (pas juste le nom de la variable)
const contactApiUrlRegex = /window\.CONTACT_API_URL\s*=\s*['"][^'"]*['"]/;
const frHasContactUrl = contactApiUrlRegex.test(indexFr);
const enHasContactUrl = contactApiUrlRegex.test(indexEn);

test('FR: CONTACT_API_URL correctement injecté', frHasContactUrl, 
  'CONTACT_API_URL pas correctement injecté dans index FR');
test('EN: CONTACT_API_URL correctement injecté', enHasContactUrl, 
  'CONTACT_API_URL pas correctement injecté dans index EN');

// Vérifier qu'il n'y a pas de variables non substituées
const hasUnsubstitutedVars = indexFr.includes('contactApiUrl;') || indexEn.includes('contactApiUrl;');
test('Pas de variables non substituées', !hasUnsubstitutedVars,
  'Variables JavaScript non substituées détectées (ex: contactApiUrl au lieu de sa valeur)');

// Vérifier les configurations GA4/GTM
test('FR: GA4_ID présent', indexFr.includes('window.GA4_ID'), 'GA4_ID manquant dans index FR');
test('FR: GTM_ID présent', indexFr.includes('window.GTM_ID'), 'GTM_ID manquant dans index FR');
test('EN: GA4_ID présent', indexEn.includes('window.GA4_ID'), 'GA4_ID manquant dans index EN');
test('EN: GTM_ID présent', indexEn.includes('window.GTM_ID'), 'GTM_ID manquant dans index EN');

// Vérifier les meta tags essentiels
test('FR: Meta charset présent', indexFr.includes('charset='), 'Meta charset manquant FR');
test('FR: Meta viewport présent', indexFr.includes('viewport'), 'Meta viewport manquant FR');
test('EN: Meta charset présent', indexEn.includes('charset='), 'Meta charset manquant EN');
test('EN: Meta viewport présent', indexEn.includes('viewport'), 'Meta viewport manquant EN');

// ============================================
// 5. TESTS FONCTIONNELS COMPLETS
// ============================================
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('🧪 PHASE 5: Tests fonctionnels complets', 'cyan');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

log('Exécution de functionality-tests.js...\n', 'yellow');
const functionalTestResult = execCommand('node scripts/functionality-tests.js', { silent: false });
const functionalTestsPass = functionalTestResult.success;

test('Tests fonctionnels complets', functionalTestsPass, 
  'Les tests fonctionnels ont échoué - voir détails ci-dessus');

// ============================================
// RAPPORT FINAL
// ============================================
log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
log('📊 RAPPORT FINAL', 'bold');
log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
log(`Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`, 
  passedTests === totalTests ? 'green' : 'yellow');

if (errors.length > 0) {
  log('\n⚠️  ERREURS DÉTECTÉES:', 'red');
  errors.forEach((error, index) => {
    log(`  ${index + 1}. ${error}`, 'red');
  });
}

if (passedTests === totalTests) {
  log('\n✅ Tous les tests sont passés! Le commit peut procéder.', 'green');
  process.exit(0);
} else {
  log('\n❌ Des tests ont échoué. Commit annulé.', 'red');
  log('Corrigez les erreurs ci-dessus avant de commiter.\n', 'yellow');
  process.exit(1);
}
