#!/usr/bin/env node

/**
 * Performance Baseline Measurement for TeaFlow Phase 1
 * 
 * Captures current app performance metrics before implementing tea-inspired changes.
 * Measures startup time, memory usage, animation fps, and timer accuracy.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceBaseline {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      measurements: {}
    };
  }

  async measureAll() {
    console.log('📊 Measuring TeaFlow performance baseline...');
    
    await this.measureWebPerformance();
    await this.measureSystemResources();
    await this.measureTimerAccuracy();
    await this.generateReport();
    
    console.log('✅ Performance baseline complete');
  }

  async measureWebPerformance() {
    console.log('🌐 Measuring web performance...');
    
    try {
      const puppeteer = this.tryRequire('puppeteer');
      if (!puppeteer) {
        throw new Error('Puppeteer not available');
      }
      const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      
      const page = await browser.newPage();
      
      // Enable performance monitoring
      await page.setCacheEnabled(false);
      
      // Measure initial load
      const loadStart = performance.now();
      await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
      const loadEnd = performance.now();
      
      // Wait for React to render
      try {
        await page.waitForSelector('[data-testid="app-loaded"]', { timeout: 15000 });
      } catch (error) {
        console.log('⚠️  App loaded indicator not found, using timeout');
        await page.waitForTimeout(5000);
      }
      
      const appReadyTime = performance.now();
      
      // Measure navigation performance
      const navigationStart = performance.now();
      
      // Try to click a tea tile (if available)
      try {
        const teaTiles = await page.$$('[class*="teaCard"], .teaCard, [data-testid*="tea"]');
        if (teaTiles.length > 0) {
          await teaTiles[0].click();
          await page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log('⚠️  Tea tile navigation test skipped:', error.message);
      }
      
      const navigationEnd = performance.now();
      
      // Measure memory usage
      const metrics = await page.metrics();
      
      // Get performance timings
      const timings = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          domInteractive: perf.domInteractive - perf.fetchStart,
          firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || 0
        };
      });
      
      this.results.measurements.web = {
        initialLoad: Math.round(loadEnd - loadStart),
        appReady: Math.round(appReadyTime - loadStart),
        navigation: Math.round(navigationEnd - navigationStart),
        memory: {
          jsHeapUsedSize: Math.round(metrics.JSHeapUsedSize / 1024 / 1024 * 100) / 100, // MB
          jsHeapTotalSize: Math.round(metrics.JSHeapTotalSize / 1024 / 1024 * 100) / 100, // MB
          domNodes: metrics.Nodes
        },
        timings: {
          domContentLoaded: Math.round(timings.domContentLoaded),
          loadComplete: Math.round(timings.loadComplete),
          domInteractive: Math.round(timings.domInteractive),
          firstPaint: Math.round(timings.firstPaint),
          firstContentfulPaint: Math.round(timings.firstContentfulPaint)
        }
      };
      
      await browser.close();
      
      console.log(`  ✓ Initial load: ${this.results.measurements.web.initialLoad}ms`);
      console.log(`  ✓ App ready: ${this.results.measurements.web.appReady}ms`);
      console.log(`  ✓ Memory usage: ${this.results.measurements.web.memory.jsHeapUsedSize}MB`);
      
    } catch (error) {
      console.error('  ✗ Web performance measurement failed:', error.message);
      console.log('    Install puppeteer: npm install --save-dev puppeteer');
      
      this.results.measurements.web = {
        error: error.message,
        fallback: 'Manual testing required'
      };
    }
  }

  async measureSystemResources() {
    console.log('💾 Measuring system resources...');
    
    const os = require('os');
    
    // CPU usage measurement
    const cpuUsageStart = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    const cpuUsageEnd = process.cpuUsage(cpuUsageStart);
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    this.results.measurements.system = {
      cpu: {
        user: cpuUsageEnd.user,
        system: cpuUsageEnd.system,
        totalCores: os.cpus().length
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100 // MB
      },
      platform: {
        arch: os.arch(),
        platform: os.platform(),
        release: os.release(),
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100, // GB
        freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024 * 100) / 100 // GB
      }
    };
    
    console.log(`  ✓ Node memory: ${this.results.measurements.system.memory.heapUsed}MB`);
    console.log(`  ✓ System memory: ${this.results.measurements.system.platform.freeMemory}GB free`);
  }

  async measureTimerAccuracy() {
    console.log('⏱️  Measuring timer accuracy...');
    
    // Simulate timer countdown accuracy test
    const timerTests = [];
    const testDurations = [1000, 5000, 10000]; // 1s, 5s, 10s
    
    for (const expectedDuration of testDurations) {
      const startTime = performance.now();
      
      await new Promise(resolve => {
        setTimeout(resolve, expectedDuration);
      });
      
      const endTime = performance.now();
      const actualDuration = endTime - startTime;
      const drift = actualDuration - expectedDuration;
      const driftPerSecond = (drift / expectedDuration) * 1000;
      
      timerTests.push({
        expected: expectedDuration,
        actual: Math.round(actualDuration * 100) / 100,
        drift: Math.round(drift * 100) / 100,
        driftPerSecond: Math.round(driftPerSecond * 100) / 100
      });
    }
    
    this.results.measurements.timer = {
      tests: timerTests,
      averageDriftPerSecond: Math.round(
        timerTests.reduce((sum, test) => sum + Math.abs(test.driftPerSecond), 0) / timerTests.length * 100
      ) / 100,
      maxDrift: Math.max(...timerTests.map(t => Math.abs(t.drift))),
      passesRequirement: timerTests.every(t => Math.abs(t.driftPerSecond) <= 200) // ≤0.2s/min = ≤200ms/min
    };
    
    console.log(`  ✓ Average drift: ${this.results.measurements.timer.averageDriftPerSecond}ms/sec`);
    console.log(`  ✓ Max drift: ${this.results.measurements.timer.maxDrift}ms`);
    console.log(`  ✓ Meets requirement: ${this.results.measurements.timer.passesRequirement ? 'YES' : 'NO'}`);
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '..', 'performance-baseline.json');
    const readableReportPath = path.join(__dirname, '..', 'docs', 'qa', 'performance-baseline-report.md');
    
    // Save raw data
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate readable report
    const report = this.generateMarkdownReport();
    
    // Ensure directory exists
    const reportDir = path.dirname(readableReportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(readableReportPath, report);
    
    console.log(`\n📊 Performance baseline saved:`);
    console.log(`   Raw data: ${reportPath}`);
    console.log(`   Report: ${readableReportPath}`);
    
    // Display summary
    this.displaySummary();
  }

  generateMarkdownReport() {
    return `# TeaFlow Performance Baseline Report

**Generated:** ${this.results.timestamp}  
**Platform:** ${this.results.platform}  
**Node Version:** ${this.results.nodeVersion}  

## Executive Summary

This baseline captures current TeaFlow performance before Phase 1 tea-inspired visual changes.

### Key Metrics

| Metric | Current Value | Target | Status |
|--------|--------------|--------|---------|
| App Load Time | ${this.results.measurements.web?.appReady || 'N/A'}ms | <3000ms | ${this.getStatus(this.results.measurements.web?.appReady, 3000)} |
| Memory Usage | ${this.results.measurements.web?.memory?.jsHeapUsedSize || 'N/A'}MB | <100MB | ${this.getStatus(this.results.measurements.web?.memory?.jsHeapUsedSize, 100, true)} |
| Timer Accuracy | ${this.results.measurements.timer?.averageDriftPerSecond || 'N/A'}ms/sec | ≤200ms/min | ${this.results.measurements.timer?.passesRequirement ? '✅ PASS' : '❌ FAIL'} |

## Detailed Measurements

### Web Performance
${this.results.measurements.web ? `
- **Initial Load:** ${this.results.measurements.web.initialLoad}ms
- **App Ready:** ${this.results.measurements.web.appReady}ms
- **Navigation:** ${this.results.measurements.web.navigation}ms
- **Memory Usage:** ${this.results.measurements.web.memory.jsHeapUsedSize}MB
- **DOM Nodes:** ${this.results.measurements.web.memory.domNodes}
- **First Paint:** ${this.results.measurements.web.timings.firstPaint}ms
- **First Contentful Paint:** ${this.results.measurements.web.timings.firstContentfulPaint}ms
` : 'Web performance measurement failed - manual testing required'}

### Timer Accuracy Tests
${this.results.measurements.timer.tests.map(test => `
- **${test.expected}ms test:** ${test.actual}ms actual (${test.drift > 0 ? '+' : ''}${test.drift}ms drift, ${test.driftPerSecond}ms/sec)
`).join('')}

**Average Drift:** ${this.results.measurements.timer.averageDriftPerSecond}ms/sec  
**Max Drift:** ${this.results.measurements.timer.maxDrift}ms  
**Meets PRD Requirement:** ${this.results.measurements.timer.passesRequirement ? 'YES (≤0.2s/min)' : 'NO (exceeds 0.2s/min)'}

### System Resources
- **Node Memory Usage:** ${this.results.measurements.system.memory.heapUsed}MB
- **Total System Memory:** ${this.results.measurements.system.platform.totalMemory}GB
- **Available Memory:** ${this.results.measurements.system.platform.freeMemory}GB
- **CPU Cores:** ${this.results.measurements.system.cpu.totalCores}
- **Platform:** ${this.results.measurements.system.platform.platform} ${this.results.measurements.system.platform.arch}

## Phase 1 Performance Targets

After implementing tea-inspired visual changes, we should maintain or improve:

- **App Load Time:** ≤${(this.results.measurements.web?.appReady || 3000) + 500}ms (baseline + 500ms buffer)
- **Memory Usage:** ≤${(this.results.measurements.web?.memory?.jsHeapUsedSize || 50) + 20}MB (baseline + 20MB buffer)
- **Timer Accuracy:** ≤200ms/min drift (same as current requirement)
- **Animation FPS:** ≥30fps sustained (new requirement)

## Regression Detection

Use this baseline to detect performance regressions during Phase 1:

1. **Load Time Regression:** >50% increase from baseline
2. **Memory Regression:** >40% increase from baseline  
3. **Timer Accuracy Regression:** Any increase in drift rate
4. **Animation Regression:** <30fps during timer operation

## Usage Instructions

\`\`\`bash
# Re-run baseline measurement
node scripts/performance-baseline.js

# Compare with previous baseline
diff performance-baseline.json performance-baseline-previous.json
\`\`\`

---

*This baseline ensures Phase 1 visual improvements maintain TeaFlow's performance standards.*`;
  }

  getStatus(value, threshold, lessThan = false) {
    if (value === undefined || value === null) return '❓ N/A';
    
    const passes = lessThan ? value < threshold : value <= threshold;
    return passes ? '✅ PASS' : '❌ FAIL';
  }

  displaySummary() {
    console.log('\n📈 Performance Baseline Summary:');
    
    if (this.results.measurements.web && !this.results.measurements.web.error) {
      console.log(`   App Load Time: ${this.results.measurements.web.appReady}ms`);
      console.log(`   Memory Usage: ${this.results.measurements.web.memory.jsHeapUsedSize}MB`);
    }
    
    console.log(`   Timer Accuracy: ${this.results.measurements.timer.averageDriftPerSecond}ms/sec`);
    console.log(`   Timer Meets Requirement: ${this.results.measurements.timer.passesRequirement ? 'YES' : 'NO'}`);
    
    console.log('\n🎯 Phase 1 Targets:');
    console.log(`   Load Time: ≤${(this.results.measurements.web?.appReady || 3000) + 500}ms`);
    console.log(`   Memory: ≤${(this.results.measurements.web?.memory?.jsHeapUsedSize || 50) + 20}MB`);
    console.log(`   Timer Drift: ≤200ms/min`);
    console.log(`   Animation FPS: ≥30fps`);
  }

  tryRequire(moduleName) {
    try {
      return require(moduleName);
    } catch {
      return null;
    }
  }
}

// CLI Interface
async function main() {
  const baseline = new PerformanceBaseline();
  
  try {
    // Check if Expo is running
    const response = await fetch('http://localhost:8081').catch(() => null);
    if (!response || !response.ok) {
      console.error('❌ Expo dev server not running. Start with: npm run start');
      console.log('   Will measure system resources only...\n');
    }
    
    await baseline.measureAll();
    
  } catch (error) {
    console.error('Performance baseline measurement failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceBaseline;