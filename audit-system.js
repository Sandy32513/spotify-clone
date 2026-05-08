#!/usr/bin/env node

/**
 * Bug Audit System for Spotify Clone
 * Performs multi-dimensional analysis of the codebase
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  orange: '\x1b[33m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

type BugSeverity = 'critical' | 'high' | 'medium' | 'low';
type BugCategory = 'security' | 'performance' | 'quality' | 'devx';

interface Bug {
  id: string;
  title: string;
  description: string;
  file?: string;
  line?: number;
  severity: BugSeverity;
  category: BugCategory;
  fix?: string;
}

const bugs: Bug[] = [];

function log(message: string, color: string = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function addBug(bug: Omit<Bug, 'id'>) {
  bugs.push({
    ...bug,
    id: `BUG-${bugs.length + 1}`,
  });
}

// ==================== DEVELOPER AUDIT ====================
function auditDeveloper() {
  log('\n👨‍💻 Developer Audit', 'cyan');
  log('─'.repeat(50), 'cyan');

  // Check for missing imports
  const tsFiles = findFiles('.', ['.ts', '.tsx']).filter((f) => !f.includes('node_modules'));

  tsFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for console.log (dev-only)
    if (content.includes('console.log(') && !file.includes('test')) {
      addBug({
        title: 'Console.log statements present',
        description: 'Remove console.log statements in production code',
        file,
        severity: 'low',
        category: 'quality',
        fix: 'Remove or replace with proper logger',
      });
    }

    // Check for any
    if (content.includes(': any')) {
      addBug({
        title: 'Using "any" type',
        description: 'TypeScript "any" defeats type safety',
        file,
        severity: 'medium',
        category: 'quality',
        fix: 'Define proper interfaces or use unknown',
      });
    }

    // Check for empty catch blocks
    if (content.match(/catch\s*\(\s*\)\s*\{/)) {
      addBug({
        title: 'Empty catch block',
        description: 'Silent errors should be logged or handled',
        file,
        severity: 'high',
        category: 'quality',
        fix: 'Add error logging or proper handling',
      });
    }

    // Check for missing dependency arrays in useEffect
    if (content.includes('useEffect(') && !content.includes('[]') && !content.includes('useEffect(')) {
      // Simplified check - would need AST parsing for accurate detection
    }
  });

  // Check for missing trailing commas in multi-line objects
  tsFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // May have multi-line object without trailing comma
      if (line.includes('{') && !line.includes('}')) {
        // Check next line
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('}')) {
          // Could add trailing comma warning
        }
      }
    }
  });

  // Check for unused variables
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (error: any) {
    const output = error.stdout?.toString() + error.stderr?.toString();
    const unusedVarMatches = output.match(/is declared but its value is never read/gi);
    if (unusedVarMatches) {
      addBug({
        title: 'Unused variables detected',
        description: 'Remove unused variables to reduce bundle size',
        severity: 'low',
        category: 'performance',
        fix: 'Delete variable or prefix with underscore',
      });
    }
  }
}

// ==================== AI ENGINEER AUDIT ====================
function auditAI() {
  log('\n🧠 AI Engineer Audit', 'magenta');
  log('─'.repeat(50), 'magenta');

  const tsFiles = findFiles('.', ['.ts', '.tsx']).filter((f) => !f.includes('node_modules'));

  tsFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for potential memory leaks in event listeners
    if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
      addBug({
        title: 'Potential memory leak',
        description: 'Event listeners not cleaned up',
        file,
        severity: 'medium',
        category: 'performance',
        fix: 'Add cleanup in useEffect return function',
      });
    }

    // Check for infinite loops in loops
    if (content.match(/while\s*\(\s*true\s*\)/)) {
      addBug({
        title: 'Infinite loop detected',
        description: 'while(true) without break condition',
        file,
        severity: 'critical',
        category: 'quality',
        fix: 'Add break condition or use different logic',
      });
    }

    // Check for async race conditions (simplified)
    if (content.includes('setTimeout') && content.includes('clearTimeout')) {
      // Might be okay, but check for proper cleanup
    }

    // Check for missing async error handling
    if (content.match(/\.then\s*\(/g) && !content.includes('.catch(')) {
      addBug({
        title: 'Unhandled promise rejection',
        description: 'Promise chains without error handling',
        file,
        severity: 'high',
        category: 'quality',
        fix: 'Add .catch() to handle errors',
      });
    }

    // Check for Zustand store without persist middleware when needed
    if (content.includes('create(') && content.includes('zustand')) {
      if (content.includes('session') || content.includes('token')) {
        if (!content.includes('persist(')) {
          addBug({
            title: 'State not persisted',
            description: 'Auth state should survive page refresh',
            file,
            severity: 'high',
            category: 'quality',
            fix: 'Wrap store with persist() middleware',
          });
        }
      }
    }
  });

  // Check for WebSocket not being closed
  const websocketFiles = tsFiles.filter((f) => f.includes('websocket') || f.includes('ws'));
  websocketFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('new WebSocket') && !content.includes('close()')) {
      addBug({
        title: 'WebSocket may not be closed properly',
        description: 'Ensure WebSocket connection cleanup',
        file,
        severity: 'medium',
        category: 'performance',
        fix: 'Add WebSocket close in cleanup function',
      });
    }
  });
}

// ==================== HACKER AUDIT ====================
function auditHacker() {
  log('\n🕵️ Hacker Security Audit', 'red');
  log('─'.repeat(50), 'red');

  const allFiles = findFiles('.', ['.ts', '.tsx', '.js', '.jsx']).filter((f) => !f.includes('node_modules'));

  allFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');

    // Check for SQL injection risk
    if (content.includes('supabase.from(') && content.includes('text(') && content.includes('+')) {
      addBug({
        title: 'Potential SQL injection',
        description: 'Concat user input directly into queries',
        file,
        severity: 'critical',
        category: 'security',
        fix: 'Use parameterized queries with .eq(), .ilike()',
      });
    }

    // Check for XSS risk - innerHTML
    if (content.includes('dangerouslySetInnerHTML')) {
      addBug({
        title: 'Potential XSS vulnerability',
        description: 'dangerouslySetInnerHTML bypasses React XSS protection',
        file,
        severity: 'critical',
        category: 'security',
        fix: 'Sanitize input or use safe alternatives',
      });
    }

    // Check for eval() usage
    if (content.includes('eval(')) {
      addBug({
        title: 'Eval usage detected',
        description: 'eval() is a security risk',
        file,
        severity: 'critical',
        category: 'security',
        fix: 'Remove eval() and use safe alternatives',
      });
    }

    // Check for exposed secrets
    const envPattern = /(?:password|secret|key|token)\s*=\s*['"]\w+/gi;
    const matches = content.match(envPattern);
    if (matches && !file.includes('.env')) {
      matches.forEach((match) => {
        addBug({
          title: 'Hardcoded secret',
          description: `Found: ${match}`,
          file,
          severity: 'critical',
          category: 'security',
          fix: 'Move to environment variables',
        });
      });
    }
  });

  // Check for missing CORS configuration
  const apiFiles = findFiles('app/api', ['.ts', '.tsx']);
  apiFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('NextResponse') && !content.includes('cors')) {
      // API may lack CORS headers
    }
  });

  // Check for admin endpoints without auth
  apiFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('createClient') && !content.includes('getUser')) {
      addBug({
        title: 'Potential unauthorized admin endpoint',
        description: 'Endpoint may allow operations without authentication',
        file,
        severity: 'high',
        category: 'security',
        fix: 'Add user authentication check',
      });
    }
  });

  // Check for rate limiting on auth endpoints
  const authRoutes = findFiles('app/api/auth', ['.ts', '.tsx']);
  authRoutes.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (!content.includes('rate')) {
      // Consider adding rate limiting recommendation
    }
  });

  // Check for service role key exposure
  const clientFiles = findFiles('lib', ['.ts', '.tsx']);
  clientFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('serviceRoleKey') && content.includes('createClient')) {
      if (file.includes('client') || file.includes('browser')) {
        addBug({
          title: 'Service role key in client bundle',
          description: 'Service role key must only be used server-side',
          file,
          severity: 'critical',
          category: 'security',
          fix: 'Move supabaseAdmin to server-only modules',
        });
      }
    }
  });
}

// ==================== PERFORMANCE AUDIT ====================
function auditPerformance() {
  log('\n⚡ Performance Audit', 'yellow');
  log('─'.repeat(50), 'yellow');

  const tsFiles = findFiles('.', ['.ts', '.tsx']).filter((f) => !f.includes('node_modules'));

  tsFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const fileSizeKB = Buffer.byteLength(content, 'utf-8') / 1024;

    // Large files
    if (fileSizeKB > 50) {
      addBug({
        title: 'Large file size',
        description: `${fileSizeKB.toFixed(2)} KB - consider code splitting`,
        file,
        severity: 'low',
        category: 'performance',
        fix: 'Split into smaller modules',
      });
    }

    // Missing React.memo for heavy components
    if (content.includes('function ') && content.includes('return (')) {
      // Check for potential re-render optimization needs
    }

    // Check for inline functions in JSX
    if (content.match(/on\w+\s*=\s*{\s*\(/)) {
      addBug({
        title: 'Inline arrow function in JSX',
        description: 'Causes unnecessary re-renders',
        file,
        severity: 'low',
        category: 'performance',
        fix: 'Extract to useCallback or bind outside JSX',
      });
    }

    // Check for phantom dependencies
    if (content.includes('useEffect') && content.includes('[]')) {
      // Good practice
    }
  });

  // Check for Image component without proper dimensions
  const jsxFiles = findFiles('.', ['.tsx', '.jsx']).filter((f) => !f.includes('node_modules'));
  jsxFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    const nextImageMatches = content.match(/<Image[^>]*>/g);
    nextImageMatches?.forEach((match) => {
      if (!match.includes('width=') || !match.includes('height=')) {
        addBug({
          title: 'Next.js Image missing dimensions',
          description: 'width and height props required for optimization',
          file,
          severity: 'medium',
          category: 'performance',
          fix: 'Add width and height or use layout="fill" with parent',
        });
      }
    });
  });

  // Check bundle size (requires next build)
  try {
    const buildOutput = execSync('npm run build 2>&1', { stdio: 'pipe' }).toString();
    if (buildOutput.includes('▲')) {
      addBug({
        title: 'Build warnings detected',
        description: 'Check build output for optimization hints',
        severity: 'medium',
        category: 'performance',
        fix: 'Review build output and address warnings',
      });
    }
  } catch (error: any) {
    // Build might fail due to other issues - that's okay
  }

  // Check for service worker registration
  const appFiles = findFiles('app', ['.tsx']);
  const hasSW = appFiles.some((f) => fs.readFileSync(f, 'utf-8').includes('navigator.serviceWorker'));
  if (!hasSW && fs.readFileSync('public/sw.js', 'utf-8').includes('self.addEventListener')) {
    // SW exists but not registered - info
  }
}

// ==================== LINT & TYPE CHECK ====================
function runLintAndTypeCheck() {
  log('\n📝 Linting & Type Checking', 'blue');
  log('─'.repeat(50), 'blue');

  try {
    execSync('npx eslint . --ext .ts,.tsx --max-warnings 0', { stdio: 'pipe' });
    log('✅ ESLint passed', 'green');
  } catch (error: any) {
    const output = error.stdout?.toString() + error.stderr?.toString();
    const matches = output.match(/✖\s*\d+\s*problems?/gi) || [];
    matches.forEach((match) => {
      addBug({
        title: 'ESLint errors found',
        description: match,
        severity: 'medium',
        category: 'quality',
        fix: 'Fix linting issues',
      });
    });
  }

  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    log('✅ TypeScript check passed', 'green');
  } catch (error: any) {
    const output = error.stdout?.toString() + error.stderr?.toString();
    const errorMatches = output.match(/error\s+TS\d+:/g) || [];
    errorMatches.forEach((match, i) => {
      addBug({
        title: 'TypeScript error',
        description: match,
        severity: 'high',
        category: 'quality',
        fix: 'Fix type errors',
      });
    });
  }
}

// ==================== HELPER FUNCTIONS ====================
function findFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      // Skip certain directories
      if (['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
        return;
      }
      results = results.concat(findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => file.endsWith(ext))) {
      results.push(fullPath);
    }
  });

  return results;
}

// ==================== MAIN ====================
function main() {
  log('🔍 Running Bug Audit System', 'green');
  log('='.repeat(50), 'green');

  runLintAndTypeCheck();
  auditDeveloper();
  auditAI();
  auditHacker();
  auditPerformance();

  // Report
  log('\n' + '='.repeat(50), 'green');
  log('📊 AUDIT REPORT', 'green');
  log('='.repeat(50), 'green');

  const critical = bugs.filter((b) => b.severity === 'critical');
  const high = bugs.filter((b) => b.severity === 'high');
  const medium = bugs.filter((b) => b.severity === 'medium');
  const low = bugs.filter((b) => b.severity === 'low');

  log(`\n🔴 Critical: ${critical.length}`, 'red');
  log(`🟠 High: ${high.length}`, 'orange');
  log(`🟡 Medium: ${medium.length}`, 'yellow');
  log(`🟢 Low: ${low.length}`, 'green');

  // Group by category
  const security = bugs.filter((b) => b.category === 'security');
  const performance = bugs.filter((b) => b.category === 'performance');
  const quality = bugs.filter((b) => b.category === 'quality');
  const devx = bugs.filter((b) => b.category === 'devx');

  log(`\n🔐 Security: ${security.length}`, 'red');
  log(`⚡ Performance: ${performance.length}`, 'yellow');
  log(`🎯 Quality: ${quality.length}`, 'cyan');
  log(`💡 Dev Experience: ${devx.length}`, 'blue');

  // Write report
  const report = generateReport();
  fs.writeFileSync('AUDIT_REPORT.md', report);
  log('\n📄 Full report saved to AUDIT_REPORT.md', 'green');

  // Exit with error code if critical bugs found
  if (critical.length > 0) {
    log(`\n⚠️  ${critical.length} critical bug(s) found! Fix before deploying.`, 'red');
    process.exit(1);
  }

  log('\n✅ Audit complete!', 'green');
}

function generateReport(): string {
  let report = '# Bug Audit Report\n\n';
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `| Severity | Count |\n`;
  report += `|----------|-------|\n`;
  report += `| 🔴 Critical | ${bugs.filter((b) => b.severity === 'critical').length} |\n`;
  report += `| 🟠 High | ${bugs.filter((b) => b.severity === 'high').length} |\n`;
  report += `| 🟡 Medium | ${bugs.filter((b) => b.severity === 'medium').length} |\n`;
  report += `| 🟢 Low | ${bugs.filter((b) => b.severity === 'low').length} |\n\n`;

  report += `## Detailed Findings\n\n`;

  const grouped = {
    security: bugs.filter((b) => b.category === 'security'),
    performance: bugs.filter((b) => b.category === 'performance'),
    quality: bugs.filter((b) => b.category === 'quality'),
    devx: bugs.filter((b) => b.category === 'devx'),
  };

  Object.entries(grouped).forEach(([category, categoryBugs]) => {
    if (categoryBugs.length === 0) return;

    report += `### ${category.charAt(0).toUpperCase() + category.slice(1)} Issues\n\n`;
    categoryBugs.forEach((bug) => {
      report += `#### ${bug.id}: ${bug.title}\n`;
      report += `- **Severity:** ${bug.severity}\n`;
      report += `- **File:** ${bug.file || 'N/A'}${bug.line ? `:${bug.line}` : ''}\n`;
      report += `- **Description:** ${bug.description}\n`;
      if (bug.fix) {
        report += `- **Fix:** ${bug.fix}\n`;
      }
      report += '\n';
    });
  });

  report += `## Recommendations\n\n`;
  report += `1. Fix all critical issues before production deployment\n`;
  report += `2. Address high-severity issues within 24 hours\n`;
  report += `3. Implement automated tests to prevent regressions\n`;
  report += `4. Set up CI/CD pipeline with automated auditing\n`;

  return report;
}

main();
