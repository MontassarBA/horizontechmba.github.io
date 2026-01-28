#!/usr/bin/env node

/**
 * HORIZONTECH MBA - Pre-Deploy Safety Check
 * Exécuter avant CHAQUE git push pour éviter les déploiements cassés
 * Usage: npm run pre-deploy-check
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

let errorCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + colors.bold + '━'.repeat(60) + colors.reset);
  console.log(colors.cyan + colors.bold + title + colors.reset);
  console.log(colors.bold + '━'.repeat(60) + colors.reset);
}

function error(message) {
  errorCount++;
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// ============================================================
// PHASE 1: Vérifier les fichiers non commitées
// ============================================================
header('PHASE 1: Vérification des changements non committés');

try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8', cwd: projectRoot });
  
  if (status.trim() !== '') {
    warn('Fichiers modifiés non committés détectés:');
    status.split('\n').forEach(line => {
      if (line) console.log('  ' + line);
    });
    error('Committez ou stashez vos modifications avant le déploiement');
  } else {
    success('Tous les changements sont committés');
  }
} catch (e) {
  warn('Impossible de vérifier le statut Git');
}

// ============================================================
// PHASE 2: Build local complet
// ============================================================
header('PHASE 2: Construction complète du projet');

try {
  log('🔨 Exécution: npm run build', 'cyan');
  execSync('npm run build', { 
    cwd: projectRoot, 
    stdio: 'inherit',
    timeout: 120000 
  });
  success('Build complété avec succès');
} catch (e) {
  error('Le build a échoué - corrigez les erreurs avant de déployer');
  process.exit(1);
}

// ============================================================
// PHASE 3: Vérifier le dossier dist
// ============================================================
header('PHASE 3: Vérification des fichiers générés');

const requiredFiles = [
  'index.html',
  'fr/index.html',
  'en/index.html',
  'fr/services/index.html',
  'en/services/index.html',
  'fr/contact/index.html',
  'en/contact/index.html',
  'fr/about/index.html',
  'en/about/index.html',
  'fr/faq/index.html',
  'en/faq/index.html',
  '_headers',
  'robots.txt',
  'sitemap.xml',
];

let missingFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const size = fs.statSync(filePath).size;
    success(`${file} (${size} bytes)`);
  } else {
    error(`Fichier manquant: ${file}`);
    missingFiles.push(file);
  }
});

// ============================================================
// PHASE 4: Vérifier le contenu HTML
// ============================================================
header('PHASE 4: Vérification du contenu HTML');

const htmlChecks = [
  {
    file: 'fr/index.html',
    checks: [
      { pattern: '<html lang="fr">', name: 'Langue FR' },
      { pattern: 'HORIZONTECH', name: 'Titre présent' },
      { pattern: 'viewport', name: 'Viewport configuré' },
      { pattern: 'G-6RR6F0GWKH', name: 'GA4 ID' },
      { pattern: 'GTM-MB2PFGKF', name: 'GTM ID' },
      { pattern: 'window.CONTACT_API_URL', name: 'API URL variable' },
    ]
  },
  {
    file: 'en/index.html',
    checks: [
      { pattern: '<html lang="en">', name: 'Langue EN' },
      { pattern: 'G-6RR6F0GWKH', name: 'GA4 ID' },
    ]
  },
];

htmlChecks.forEach(({ file, checks }) => {
  const filePath = path.join(distDir, file);
  
  if (!fs.existsSync(filePath)) {
    error(`${file} introuvable`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  
  checks.forEach(({ pattern, name }) => {
    if (content.includes(pattern)) {
      success(`${file}: ${name}`);
    } else {
      error(`${file}: MANQUANT - ${name}`);
    }
  });
});

// ============================================================
// PHASE 5: Vérifier les erreurs JavaScript
// ============================================================
header('PHASE 5: Vérification des fichiers JavaScript');

const jsDir = path.join(distDir, '_astro');
if (fs.existsSync(jsDir)) {
  const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  
  jsFiles.forEach(file => {
    const filePath = path.join(jsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Chercher les erreurs communes
    if (content.includes('undefined is not') || content.includes('Cannot read')) {
      error(`${file}: Contient une erreur potentielle`);
    } else {
      success(`${file}: OK (${content.length} bytes)`);
    }
  });
} else {
  warn('Dossier _astro non trouvé');
}

// ============================================================
// PHASE 6: Vérifier les en-têtes de sécurité
// ============================================================
header('PHASE 6: Vérification des en-têtes de sécurité');

const headersFile = path.join(projectRoot, 'public', '_headers');
if (fs.existsSync(headersFile)) {
  const headersContent = fs.readFileSync(headersFile, 'utf-8');
  
  const securityChecks = [
    { header: 'X-Frame-Options', name: 'Anti-clickjacking' },
    { header: 'X-Content-Type-Options', name: 'MIME sniffing protection' },
    { header: 'Strict-Transport-Security', name: 'HSTS' },
    { header: 'Content-Security-Policy', name: 'CSP' },
    { header: 'formspree.io', name: 'Formspree domains' },
  ];
  
  securityChecks.forEach(({ header, name }) => {
    if (headersContent.includes(header)) {
      success(`${name}: ${header}`);
    } else {
      warn(`${name}: MANQUANT - ${header}`);
    }
  });
} else {
  warn('Fichier _headers non trouvé');
}

// ============================================================
// PHASE 7: Exécuter les tests automatisés
// ============================================================
header('PHASE 7: Exécution des tests automatisés');

try {
  log('🧪 Tests de sécurité...', 'cyan');
  execSync('npm run test', { cwd: projectRoot, stdio: 'pipe' });
  success('Tests de sécurité: PASSÉ');
} catch (e) {
  error('Tests de sécurité: ÉCHOUÉ');
}

try {
  log('🧪 Tests fonctionnels...', 'cyan');
  execSync('npm run test:functional', { cwd: projectRoot, stdio: 'pipe' });
  success('Tests fonctionnels: PASSÉ');
} catch (e) {
  error('Tests fonctionnels: ÉCHOUÉ');
}

// ============================================================
// PHASE 8: Résumé et décision
// ============================================================
header('RÉSUMÉ PRÉ-DÉPLOIEMENT');

if (errorCount === 0) {
  log('\n✅ ' + colors.bold + 'TOUS LES CONTRÔLES PASSÉS' + colors.reset, 'green');
  log('\n✨ Vous pouvez déployer en toute confiance!\n', 'green');
  process.exit(0);
} else {
  log(`\n❌ ${colors.bold}${errorCount} ERREURS DÉTECTÉES${colors.reset}`, 'red');
  log('\n🛑 NE DÉPLOYEZ PAS TANT QUE CES ERREURS NE SONT PAS CORRIGÉES\n', 'red');
  log('💡 Conseils:', 'yellow');
  log('  1. Corrigez les erreurs de build', 'yellow');
  log('  2. Exécutez: npm run pre-deploy-check', 'yellow');
  log('  3. Une fois tout vert: git push origin main', 'yellow');
  process.exit(1);
}
