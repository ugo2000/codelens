/**
 * CodeLens — Web Dashboard Server
 * Serves the interactive analysis dashboard.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

function start(webData) {
  const app = express();
  const PORT = 6789;
  const publicDir = path.join(__dirname, 'public');

  // Inject scan data into HTML (before </head> so it's ready when app.js runs)
  app.get('/', (req, res) => {
    let html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf-8');
    const inject = `<script>window.__CODELENS_DATA__ = ${JSON.stringify(webData)};</script>`;
    html = html.replace('</head>', `${inject}\n</head>`);
    res.send(html);
  });

  app.use(express.static(publicDir));

  // API endpoint for programmatic access
  app.get('/api/scan', (req, res) => res.json(webData));
  app.get('/api/docs', (req, res) => {
    const { generateFullDocs, generateProjectInsights } = require('../engine/analyzer');
    const insights = generateProjectInsights(webData);
    const docs = generateFullDocs(webData, insights);
    res.type('text/markdown').send(docs);
  });

  const server = app.listen(PORT, () => {
    console.log(`  🌐  Dashboard: ${`\x1b[36mhttp://localhost:${PORT}\x1b[0m`}`);
    console.log(`  📡  API:       ${`\x1b[36mhttp://localhost:${PORT}/api/scan\x1b[0m`}`);
    console.log(`  📄  Docs:      ${`\x1b[36mhttp://localhost:${PORT}/api/docs\x1b[0m`}`);
    console.log();
    console.log(`  ${'█'.repeat(40)}`);
    console.log(`  🔍 Scanning: ${webData.projectName}`);
    console.log(`  📊 ${webData.totalFiles} files ｜ ${webData.totalLines.toLocaleString()} lines ｜ ${webData.primaryLanguage}`);
    console.log();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`  ❌ Port ${PORT} is already in use.`);
      console.error(`     Another CodeLens instance may be running.`);
      console.error(`     Stop it first, or visit http://localhost:${PORT}`);
      process.exit(1);
    }
    throw err;
  });
}

module.exports = { start };
