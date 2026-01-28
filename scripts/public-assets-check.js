#!/usr/bin/env node

/**
 * PUBLIC ASSETS INTEGRITY CHECK
 * Vérifie que tous les fichiers statiques du dossier public
 * sont correctement copiés dans le build dist
 * 
 * Prévient les problèmes comme:
 * - CNAME manquant (erreur 404 sur domaine personnalisé)
 * - Fichiers de configuration manquants
 * - Robots.txt ou sitemap.xml manquants
 * - Headers de sécurité manquants
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const distDir = path.join(projectRoot, 'dist');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + colors.bold + '━'.repeat(70) + colors.reset);
  console.log(colors.cyan + colors.bold + title + colors.reset);
  console.log(colors.bold + '━'.repeat(70) + colors.reset);
}

function pass(message) {
  testsPassed++;
  log(`✅ ${message}`, 'green');
}

function fail(message) {
  testsFailed++;
  log(`❌ ${message}`, 'red');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// ============================================================
// TEST 1: Vérifier les fichiers dans public/
// ============================================================
header('TEST 1: Vérification de l\'intégrité du dossier public/');

const requiredPublicFiles = [
  { name: 'CNAME', critical: true, description: 'Configuration du domaine personnalisé' },
  { name: '_headers', critical: true, description: 'En-têtes de sécurité Cloudflare' },
  { name: 'robots.txt', critical: true, description: 'Configuration SEO pour les robots' },
  { name: 'sitemap.xml', critical: true, description: 'Plan du site pour les moteurs de recherche' },
  { name: 'favicon.svg', critical: false, description: 'Icône du site' },
  { name: 'logo.png', critical: false, description: 'Logo en PNG' },
  { name: 'logo.webp', critical: false, description: 'Logo en WebP (optimisé)' },
];

requiredPublicFiles.forEach(file => {
  const filePath = path.join(publicDir, file.name);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const emoji = file.critical ? '🔴' : '🟢';
    pass(`${emoji} ${file.name} (${stats.size} bytes) - ${file.description}`);
  } else {
    const msg = `${file.name} MANQUANT - ${file.description}`;
    if (file.critical) {
      fail(msg);
    } else {
      warn(msg);
    }
  }
});

// ============================================================
// TEST 2: Vérifier que les fichiers sont dans dist/
// ============================================================
header('TEST 2: Vérification de la copie vers le dossier dist/');

requiredPublicFiles.forEach(file => {
  const distPath = path.join(distDir, file.name);
  if (fs.existsSync(distPath)) {
    const distStats = fs.statSync(distPath);
    const publicStats = fs.statSync(path.join(publicDir, file.name));
    
    // Vérifier que le fichier n'est pas vide
    if (distStats.size > 0) {
      pass(`${file.name} dans dist/ (${distStats.size} bytes)`);
    } else {
      fail(`${file.name} dans dist/ mais VIDE (0 bytes)`);
    }
  } else {
    if (file.critical) {
      fail(`⚠️  CRITIQUE: ${file.name} MANQUANT dans dist/`);
    }
  }
});

// ============================================================
// TEST 3: Vérifier le contenu du CNAME
// ============================================================
header('TEST 3: Vérification du contenu du CNAME');

try {
  const cnamePublic = path.join(publicDir, 'CNAME');
  const cnameDist = path.join(distDir, 'CNAME');
  
  if (fs.existsSync(cnamePublic)) {
    const publicContent = fs.readFileSync(cnamePublic, 'utf-8').trim();
    
    if (publicContent === 'www.horizontechmba.com') {
      pass(`CNAME contient le bon domaine: ${publicContent}`);
    } else {
      fail(`CNAME contient: "${publicContent}" (attendu: "www.horizontechmba.com")`);
    }
    
    if (fs.existsSync(cnameDist)) {
      const distContent = fs.readFileSync(cnameDist, 'utf-8').trim();
      if (distContent === publicContent) {
        pass(`CNAME dans dist/ correspond à public/`);
      } else {
        fail(`CNAME différent entre public/ et dist/`);
      }
    }
  }
} catch (e) {
  fail(`Erreur lors de la lecture du CNAME: ${e.message}`);
}

// ============================================================
// TEST 4: Vérifier les en-têtes de sécurité
// ============================================================
header('TEST 4: Vérification des en-têtes de sécurité');

try {
  const headersPath = path.join(distDir, '_headers');
  if (fs.existsSync(headersPath)) {
    const headersContent = fs.readFileSync(headersPath, 'utf-8');
    
    const requiredHeaders = [
      { name: 'X-Frame-Options', description: 'Anti-clickjacking' },
      { name: 'X-Content-Type-Options', description: 'Protection MIME sniffing' },
      { name: 'Strict-Transport-Security', description: 'Force HTTPS' },
      { name: 'Content-Security-Policy', description: 'Politique de sécurité' },
      { name: 'form-action', description: 'Contrôle des soumissions de formulaire' },
    ];
    
    requiredHeaders.forEach(header => {
      if (headersContent.includes(header.name)) {
        pass(`${header.name} présent - ${header.description}`);
      } else {
        fail(`${header.name} MANQUANT - ${header.description}`);
      }
    });
    
    // Vérifier Formspree dans CSP
    if (headersContent.includes('formspree.io')) {
      pass('Domaine Formspree dans CSP');
    } else {
      fail('Domaine Formspree MANQUANT dans CSP');
    }
  } else {
    fail('Fichier _headers MANQUANT dans dist/');
  }
} catch (e) {
  fail(`Erreur lors de la lecture des headers: ${e.message}`);
}

// ============================================================
// TEST 5: Vérifier robots.txt
// ============================================================
header('TEST 5: Vérification de robots.txt');

try {
  const robotsPath = path.join(distDir, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    
    if (robotsContent.includes('User-agent')) {
      pass('robots.txt contient User-agent');
    } else {
      fail('robots.txt malformé (pas de User-agent)');
    }
    
    if (robotsContent.includes('Sitemap')) {
      pass('robots.txt contient référence au sitemap');
    } else {
      warn('robots.txt ne contient pas de référence au sitemap');
    }
  } else {
    fail('robots.txt MANQUANT dans dist/');
  }
} catch (e) {
  fail(`Erreur lors de la lecture de robots.txt: ${e.message}`);
}

// ============================================================
// TEST 6: Vérifier sitemap.xml
// ============================================================
header('TEST 6: Vérification de sitemap.xml');

try {
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
    
    if (sitemapContent.includes('<?xml')) {
      pass('sitemap.xml est valide XML');
    } else {
      fail('sitemap.xml ne commence pas par <?xml');
    }
    
    if (sitemapContent.includes('<loc>')) {
      pass('sitemap.xml contient des URLs');
    } else {
      fail('sitemap.xml ne contient pas d\'URLs');
    }
    
    // Compter les URLs
    const urlCount = (sitemapContent.match(/<loc>/g) || []).length;
    info(`sitemap.xml contient ${urlCount} URLs`);
    
    if (urlCount < 10) {
      warn(`sitemap.xml semble avoir peu d'URLs (${urlCount})`);
    } else {
      pass(`Nombre d'URLs satisfaisant: ${urlCount}`);
    }
  } else {
    fail('sitemap.xml MANQUANT dans dist/');
  }
} catch (e) {
  fail(`Erreur lors de la lecture de sitemap.xml: ${e.message}`);
}

// ============================================================
// TEST 7: Vérifier la configuration Astro
// ============================================================
header('TEST 7: Vérification de la configuration Astro');

try {
  const astroConfigPath = path.join(projectRoot, 'astro.config.mjs');
  if (fs.existsSync(astroConfigPath)) {
    const configContent = fs.readFileSync(astroConfigPath, 'utf-8');
    
    if (configContent.includes('public')) {
      pass('astro.config.mjs configure le dossier public');
    }
  }
} catch (e) {
  warn(`Impossible de vérifier la configuration Astro: ${e.message}`);
}

// ============================================================
// RÉSUMÉ FINAL
// ============================================================
header('RÉSUMÉ DE LA VÉRIFICATION');

const totalTests = testsPassed + testsFailed;
const successRate = totalTests > 0 ? ((testsPassed / totalTests) * 100).toFixed(1) : 0;

console.log();
log(`Tests réussis: ${testsPassed}/${totalTests} (${successRate}%)`, 'cyan');

if (testsFailed === 0) {
  console.log();
  log('✨ TOUS LES FICHIERS PUBLICS SONT CORRECTEMENT CONFIGURÉS!', 'green');
  log('🚀 Prêt pour le déploiement', 'green');
  process.exit(0);
} else {
  console.log();
  log(`⚠️  ${testsFailed} problème(s) détecté(s)`, 'red');
  log('🛑 CORRIGEZ CES PROBLÈMES AVANT DE DÉPLOYER', 'red');
  console.log();
  log('💡 Comment corriger:', 'yellow');
  log('  1. Vérifiez que tous les fichiers requis sont dans public/', 'yellow');
  log('  2. Vérifiez le contenu du CNAME: www.horizontechmba.com', 'yellow');
  log('  3. Relancez npm run build', 'yellow');
  log('  4. Relancez ce script: npm run check:public-assets', 'yellow');
  process.exit(1);
}
