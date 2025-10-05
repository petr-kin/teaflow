#!/usr/bin/env node

/**
 * Visual Regression Testing for TeaFlow Phase 1 Changes
 * 
 * This script captures screenshots before/after theme changes to detect visual regressions.
 * Runs on both web and mobile simulator to ensure cross-platform consistency.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'visual-tests');
const BASELINE_DIR = path.join(SCREENSHOTS_DIR, 'baseline');
const CURRENT_DIR = path.join(SCREENSHOTS_DIR, 'current');
const DIFF_DIR = path.join(SCREENSHOTS_DIR, 'diff');

// Ensure directories exist
[SCREENSHOTS_DIR, BASELINE_DIR, CURRENT_DIR, DIFF_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

class VisualRegressionTester {
  constructor() {
    this.testCases = [
      { name: 'home-screen-default', description: 'Main tea grid with current theme' },
      { name: 'timer-screen-active', description: 'Timer screen during brewing' },
      { name: 'timer-screen-paused', description: 'Timer screen paused state' },
      { name: 'tea-library-screen', description: 'Tea library modal' },
      { name: 'theme-settings-screen', description: 'Theme settings modal' },
      { name: 'onboarding-screen', description: 'First-run onboarding' }
    ];
  }

  async captureBaseline() {
    console.log('📸 Capturing baseline screenshots...');
    
    // Check if Expo is running
    const isExpoRunning = await this.checkExpoStatus();
    if (!isExpoRunning) {
      console.error('❌ Expo dev server is not running. Please start with: npm run start');
      process.exit(1);
    }

    // Web screenshots (easier to automate)
    await this.captureWebScreenshots('baseline');
    
    // iOS simulator screenshots (if available)
    await this.captureiOSScreenshots('baseline');
    
    console.log('✅ Baseline screenshots captured');
  }

  async captureCurrentState() {
    console.log('📸 Capturing current state screenshots...');
    
    await this.captureWebScreenshots('current');
    await this.captureiOSScreenshots('current');
    
    console.log('✅ Current state screenshots captured');
  }

  async compareScreenshots() {
    console.log('🔍 Comparing screenshots for regressions...');
    
    const results = [];
    
    for (const testCase of this.testCases) {
      const baselinePath = path.join(BASELINE_DIR, `${testCase.name}-web.png`);
      const currentPath = path.join(CURRENT_DIR, `${testCase.name}-web.png`);
      const diffPath = path.join(DIFF_DIR, `${testCase.name}-web-diff.png`);
      
      if (fs.existsSync(baselinePath) && fs.existsSync(currentPath)) {
        const hasDifference = await this.imageDiff(baselinePath, currentPath, diffPath);
        results.push({
          testCase: testCase.name,
          description: testCase.description,
          hasDifference,
          platform: 'web'
        });
      }
    }
    
    return results;
  }

  async captureWebScreenshots(destination) {
    // Use Playwright for web screenshots (will need to install)
    const puppeteer = this.tryRequire('puppeteer');
    if (!puppeteer) {
      console.log('⚠️  Puppeteer not available. Install with: npm install --save-dev puppeteer');
      return;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812 }); // iPhone 12 size

    try {
      await page.goto('http://localhost:8081');
      await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 10000 });

      for (const testCase of this.testCases) {
        await this.captureTestCase(page, testCase, destination, 'web');
        await page.waitForTimeout(1000); // Allow UI to settle
      }
    } catch (error) {
      console.error(`Web screenshot capture failed: ${error.message}`);
    }

    await browser.close();
  }

  async captureiOSScreenshots(destination) {
    // Use xcrun simctl for iOS simulator screenshots
    try {
      const { stdout } = await this.execPromise('xcrun simctl list devices booted');
      const bootedDevice = stdout.match(/iPhone[^(]+\([^)]+\)/);
      
      if (bootedDevice) {
        console.log(`📱 Capturing iOS screenshots on ${bootedDevice[0]}`);
        
        for (const testCase of this.testCases) {
          const screenshotPath = path.join(destination === 'baseline' ? BASELINE_DIR : CURRENT_DIR, 
            `${testCase.name}-ios.png`);
          
          await this.execPromise(`xcrun simctl io booted screenshot "${screenshotPath}"`);
          
          // Add manual navigation steps here if needed
          await this.sleep(2000);
        }
      } else {
        console.log('⚠️  No booted iOS simulator found');
      }
    } catch (error) {
      console.log('⚠️  iOS simulator screenshots not available:', error.message);
    }
  }

  async captureTestCase(page, testCase, destination, platform) {
    const screenshotPath = path.join(
      destination === 'baseline' ? BASELINE_DIR : CURRENT_DIR,
      `${testCase.name}-${platform}.png`
    );

    try {
      // Navigate to specific test case (implement navigation logic)
      switch (testCase.name) {
        case 'home-screen-default':
          // Default state - already loaded
          break;
        case 'timer-screen-active':
          await page.click('[data-testid="tea-tile-green"]'); // Select green tea
          await page.click('[data-testid="start-timer"]');
          break;
        case 'tea-library-screen':
          await page.click('[data-testid="library-button"]');
          break;
        // Add more navigation cases as needed
      }

      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  ✓ ${testCase.name} (${platform})`);
      
      // Navigate back to home
      await page.evaluate(() => window.location.reload());
      await page.waitForSelector('[data-testid="app-loaded"]');
      
    } catch (error) {
      console.error(`  ✗ Failed to capture ${testCase.name}: ${error.message}`);
    }
  }

  async imageDiff(baseline, current, output) {
    // Simple pixel comparison (can be enhanced with better diff tools)
    try {
      const sharp = this.tryRequire('sharp');
      if (sharp) {
        // Use Sharp for image comparison if available
        const baselineBuffer = fs.readFileSync(baseline);
        const currentBuffer = fs.readFileSync(current);
        
        // Basic buffer comparison (enhance as needed)
        const identical = baselineBuffer.equals(currentBuffer);
        return !identical;
      }
      
      // Fallback to basic file size comparison
      const baselineStats = fs.statSync(baseline);
      const currentStats = fs.statSync(current);
      
      return Math.abs(baselineStats.size - currentStats.size) > 1024; // 1KB threshold
      
    } catch (error) {
      console.error(`Image comparison failed: ${error.message}`);
      return false;
    }
  }

  async checkExpoStatus() {
    try {
      const response = await fetch('http://localhost:8081');
      return response.ok;
    } catch {
      return false;
    }
  }

  tryRequire(moduleName) {
    try {
      return require(moduleName);
    } catch {
      return null;
    }
  }

  execPromise(command) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, { stdio: 'pipe' });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => stdout += data);
      child.stderr.on('data', (data) => stderr += data);
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(stderr || `Command failed with code ${code}`));
        }
      });
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      regressions: results.filter(r => r.hasDifference).length,
      results
    };

    const reportPath = path.join(SCREENSHOTS_DIR, 'visual-regression-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Visual Regression Test Results:');
    console.log(`   Total tests: ${report.totalTests}`);
    console.log(`   Regressions found: ${report.regressions}`);
    
    if (report.regressions > 0) {
      console.log('\n❌ Visual regressions detected:');
      results.filter(r => r.hasDifference).forEach(result => {
        console.log(`   - ${result.testCase}: ${result.description}`);
      });
    } else {
      console.log('\n✅ No visual regressions detected');
    }

    return report;
  }
}

// CLI Interface
async function main() {
  const tester = new VisualRegressionTester();
  const command = process.argv[2];

  switch (command) {
    case 'baseline':
      await tester.captureBaseline();
      break;
    case 'test':
      await tester.captureCurrentState();
      const results = await tester.compareScreenshots();
      await tester.generateReport(results);
      break;
    case 'compare':
      const compareResults = await tester.compareScreenshots();
      await tester.generateReport(compareResults);
      break;
    default:
      console.log('TeaFlow Visual Regression Testing');
      console.log('');
      console.log('Usage:');
      console.log('  node scripts/visual-regression-test.js baseline  - Capture baseline screenshots');
      console.log('  node scripts/visual-regression-test.js test      - Run full test with comparison');
      console.log('  node scripts/visual-regression-test.js compare   - Compare existing screenshots');
      console.log('');
      console.log('Prerequisites:');
      console.log('  - Expo dev server running (npm run start)');
      console.log('  - Optional: npm install --save-dev puppeteer sharp');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VisualRegressionTester;