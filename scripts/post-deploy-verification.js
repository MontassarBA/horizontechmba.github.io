/**
 * POST-DEPLOYMENT VERIFICATION TESTS
 * 
 * This script runs AFTER deployment to verify the site is live and accessible.
 * It catches issues like:
 * - 404 errors on the deployed site
 * - Missing pages or broken redirects
 * - DNS/CNAME configuration problems
 * 
 * Run this after GitHub Pages deployment completes.
 */

import https from 'https';
import http from 'http';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test configuration
// When CNAME is configured, GitHub Pages redirects github.io domain to custom domain
// So we only test the custom domain to avoid false 404s
const SITES_TO_TEST = [
  'https://www.horizontechmba.com'
  // Note: montassarba.github.io will return 404 when CNAME is set (this is expected)
];

const CRITICAL_PATHS = [
  '/',           // Root redirect
  '/fr/',        // French homepage
  '/fr/about/',  // French about
  '/fr/services/',
  '/fr/contact/',
  '/en/',        // English homepage
  '/en/about/',
  '/en/services/',
  '/en/contact/',
];

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Make HTTP request and follow redirects
 */
function makeRequest(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'HorizonTech-MBA-Deploy-Verification/1.0'
      }
    };

    const req = protocol.request(options, (res) => {
      let redirectCount = 0;
      
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (redirectCount >= maxRedirects) {
          reject(new Error(`Too many redirects (${redirectCount})`));
          return;
        }
        
        redirectCount++;
        const redirectUrl = new URL(res.headers.location, url);
        makeRequest(redirectUrl.href, maxRedirects - 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Test a single URL
 */
async function testUrl(baseUrl, path) {
  const fullUrl = baseUrl + path;
  totalTests++;
  
  try {
    const response = await makeRequest(fullUrl);
    
    if (response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS${COLORS.reset}: ${fullUrl} (${response.statusCode})`);
      passedTests++;
      return true;
    } else if (response.statusCode === 404) {
      console.log(`${COLORS.red}❌ FAIL${COLORS.reset}: ${fullUrl} returned 404 NOT FOUND`);
      failedTests++;
      return false;
    } else {
      console.log(`${COLORS.yellow}⚠️  WARN${COLORS.reset}: ${fullUrl} (${response.statusCode} ${response.statusMessage})`);
      failedTests++;
      return false;
    }
  } catch (error) {
    console.log(`${COLORS.red}❌ ERROR${COLORS.reset}: ${fullUrl} - ${error.message}`);
    failedTests++;
    return false;
  }
}

/**
 * Test redirect functionality
 */
async function testRedirect(baseUrl) {
  const rootUrl = baseUrl + '/';
  totalTests++;
  
  try {
    console.log(`\n${COLORS.cyan}🔄 Testing redirect: ${rootUrl} → /fr/${COLORS.reset}`);
    const response = await makeRequest(rootUrl);
    
    // Check if we have the redirect page with meta refresh
    if (response.body.includes('meta http-equiv="refresh"') && 
        response.body.includes('url=/fr/')) {
      console.log(`${COLORS.green}✅ PASS${COLORS.reset}: Root has redirect page with meta refresh to /fr/`);
      passedTests++;
      return true;
    } 
    // Or check if we got redirected to the French page directly
    else if (response.body.includes('lang="fr"') && response.statusCode === 200) {
      console.log(`${COLORS.green}✅ PASS${COLORS.reset}: Root redirected successfully to French page`);
      passedTests++;
      return true;
    } else {
      console.log(`${COLORS.red}❌ FAIL${COLORS.reset}: Root redirect page not configured correctly`);
      failedTests++;
      return false;
    }
  } catch (error) {
    console.log(`${COLORS.red}❌ ERROR${COLORS.reset}: ${rootUrl} - ${error.message}`);
    failedTests++;
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.blue}  POST-DEPLOYMENT VERIFICATION - PRODUCTION SITE ACCESSIBILITY${COLORS.reset}`);
  console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);
  
  console.log(`${COLORS.cyan}⏰ Started at: ${new Date().toISOString()}${COLORS.reset}\n`);

  for (const site of SITES_TO_TEST) {
    console.log(`\n${COLORS.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
    console.log(`${COLORS.yellow}🌐 Testing: ${site}${COLORS.reset}`);
    console.log(`${COLORS.yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

    // Test redirect first
    await testRedirect(site);
    
    // Wait a bit between redirect test and page tests
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test all critical paths
    console.log(`\n${COLORS.cyan}📄 Testing critical pages...${COLORS.reset}\n`);
    for (const path of CRITICAL_PATHS) {
      await testUrl(site, path);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Final report
  console.log(`\n${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.blue}  FINAL REPORT${COLORS.reset}`);
  console.log(`${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);
  
  console.log(`Total tests: ${totalTests}`);
  console.log(`${COLORS.green}✅ Passed: ${passedTests}${COLORS.reset}`);
  console.log(`${COLORS.red}❌ Failed: ${failedTests}${COLORS.reset}`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log(`${COLORS.green}🎉 All post-deployment tests passed!${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Site is live and accessible.${COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${COLORS.red}⚠️  ${failedTests} test(s) failed!${COLORS.reset}`);
    console.log(`${COLORS.red}❌ Site may not be properly deployed or accessible.${COLORS.reset}\n`);
    console.log(`${COLORS.yellow}💡 Troubleshooting steps:${COLORS.reset}`);
    console.log(`   1. Check GitHub Pages deployment status`);
    console.log(`   2. Verify DNS configuration for custom domain`);
    console.log(`   3. Check CNAME file is present in deployment`);
    console.log(`   4. Wait a few minutes for DNS propagation`);
    console.log(`   5. Run: gh workflow run "Deploy to GitHub Pages"\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
  process.exit(1);
});
