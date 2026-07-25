#!/usr/bin/env node
/**
 * CodeLens CLI — Entry Point
 * Usage: codelens <command> [options]
 *
 * Commands:
 *   analyze    [path]     Analyze a codebase and print docs
 *   serve      [path]     Start web dashboard
 *   init                  Initialize .codelens config
 *   help                  Show this help
 */

const path = require('path');
const fs = require('fs');
const chalk = (() => { try { return require('chalk'); } catch { return { green: s=>s, blue: s=>s, yellow: s=>s, red: s=>s, bold: s=>s, gray: s=>s }; } })();

const scanner = require('../engine/scanner');
const analyzer = require('../engine/analyzer');

function printBanner() {
  console.log(`
  ╔══════════════════════════════════╗
  ║   🔍  CodeLens v1.0             ║
  ║   AI-Powered Codebase Intel     ║
  ╚══════════════════════════════════╝
  `);
}

function printHelp() {
  printBanner();
  console.log('  Usage:');
  console.log('    codelens analyze [path]     Analyze codebase & generate docs');
  console.log('    codelens serve  [path]      Launch interactive web dashboard');
  console.log('    codelens init               Initialize config');
  console.log('    codelens help               Show this help');
  console.log();
  console.log('  Examples:');
  console.log('    codelens analyze .           Analyze current directory');
  console.log('    codelens serve ./my-project  Launch dashboard for project');
  console.log();
  process.exit(0);
}

function analyzeCommand(targetPath) {
  printBanner();
  const absPath = path.resolve(targetPath || '.');

  console.log(`  📂  Scanning: ${chalk.bold(absPath)}\n`);

  try {
    const project = scanner.scanProject(absPath);
    const insights = analyzer.generateProjectInsights(project);
    const docs = analyzer.generateFullDocs(project, insights);
    const archDiagram = analyzer.generateArchitectureDiagram(project, insights);

    // Print summary
    console.log(`  ✅  Scan complete — ${project.totalFiles} files, ${project.totalLines.toLocaleString()} lines`);
    console.log(`  ⏱   ${project.scanTimeMs}ms\n`);
    console.log(`  🏷️   ${chalk.green(insights.projectType)}  |  ${chalk.blue('Primary: ' + insights.primaryLanguage)}`);
    console.log();

    // Print languages
    console.log(`  ${chalk.bold('Languages:')}`);
    insights.languages.forEach(l => {
      const bar = '█'.repeat(Math.round(l.percentage / 5));
      console.log(`    ${l.name.padEnd(12)} ${bar.padEnd(20)} ${l.count} files (${l.percentage}%)`);
    });
    console.log();

    // Print modules
    if (insights.modules.length > 0) {
      console.log(`  ${chalk.bold('Modules:')}`);
      insights.modules.forEach(m => {
        console.log(`    📁 ${m.name.padEnd(20)} ${m.files} files, ${m.lines.toLocaleString()} lines`);
      });
      console.log();
    }

    // Print architecture diagram
    console.log(`  ${chalk.bold('Architecture:')}`);
    console.log();
    const lines = archDiagram.split('\n');
    lines.forEach(l => console.log(`    ${l}`));
    console.log();

    // Print top declarations
    if (project.declarations.length > 0) {
      console.log(`  ${chalk.bold('Key Definitions (top 15):')}`);
      project.declarations.slice(0, 15).forEach(d => {
        console.log(`    ${chalk.yellow(d.type.padEnd(9))} ${chalk.bold(d.name).padEnd(25)} ${chalk.gray(d.file)}`);
      });
      console.log();
    }

    // Save docs to file
    const outDir = path.join(absPath, '.codelens');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(path.join(outDir, 'README.generated.md'), docs);
    fs.writeFileSync(path.join(outDir, 'insights.json'), JSON.stringify(analyzer.generateWebData(project, insights), null, 2));
    fs.writeFileSync(path.join(outDir, 'architecture.mermaid'), archDiagram);

    console.log(`  💾  Output saved to: ${chalk.green(outDir + '\\')}`);
    console.log(`      📄 README.generated.md`);
    console.log(`      📄 insights.json`);
    console.log(`      📄 architecture.mermaid`);
    console.log();
    console.log(`  ${chalk.bold('✨ Done!')} Run ${chalk.green('codelens serve ' + absPath)} for interactive dashboard`);
    console.log();

  } catch (err) {
    console.error(`  ${chalk.red('✖ Error:')} ${err.message}`);
    process.exit(1);
  }
}

function serveCommand(targetPath) {
  const absPath = path.resolve(targetPath || '.');
  
  // Quick scan first
  try {
    const project = scanner.scanProject(absPath);
    const insights = analyzer.generateProjectInsights(project);
    const webData = analyzer.generateWebData(project, insights);

    // Save scan data for web server
    const cacheDir = path.join(__dirname, '..', 'web', 'public', 'data');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'scan-result.json'), JSON.stringify(webData, null, 2));

    // Start web server
    const server = require('../web/server');
    server.start(webData);
  } catch (err) {
    console.error(`  ${chalk.red('✖ Error:')} ${err.message}`);
    process.exit(1);
  }
}

// ====== CLI Router ======
const args = process.argv.slice(2);
const cmd = args[0] || 'help';
const cmdArg = args[1];

switch (cmd) {
  case 'analyze':
  case 'a':
    analyzeCommand(cmdArg);
    break;
  case 'serve':
  case 's':
    serveCommand(cmdArg);
    break;
  case 'init':
    printBanner();
    const cfgPath = path.join(process.cwd(), '.codelensrc.json');
    if (!fs.existsSync(cfgPath)) {
      fs.writeFileSync(cfgPath, JSON.stringify({ ignore: ['node_modules', '.git', 'dist'], output: '.codelens' }, null, 2));
      console.log('  ✅  Created .codelensrc.json');
    } else {
      console.log('  ℹ️   .codelensrc.json already exists');
    }
    break;
  case 'help':
  case '-h':
  case '--help':
  default:
    printHelp();
}
