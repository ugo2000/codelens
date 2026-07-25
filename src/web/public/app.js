/**
 * CodeLens — Frontend Controller
 * Interactive dashboard for codebase intelligence.
 */

const DATA = window.__CODELENS_DATA__ || {};
const COLORS = ['lang-color-0','lang-color-1','lang-color-2','lang-color-3','lang-color-4','lang-color-5','lang-color-6','lang-color-7'];

function $(id) { return document.getElementById(id); }

// ====== Init ======
document.addEventListener('DOMContentLoaded', () => {
  if (!DATA.projectName) {
    console.error('No scan data found. Run `codelens serve` first.');
    $('projectTitle').textContent = 'No data loaded';
    return;
  }
  renderAll();
});

function renderAll() {
  // Header
  $('projectTitle').textContent = DATA.projectName;

  // Hero
  $('heroProject').textContent = DATA.projectName;
  $('metaFiles').textContent = DATA.totalFiles;
  $('metaLines').textContent = DATA.totalLines.toLocaleString();
  $('metaType').textContent = DATA.projectType;
  $('metaLang').textContent = DATA.primaryLanguage;

  // Stats
  $('statFiles').textContent = DATA.totalFiles;
  $('statLines').textContent = DATA.totalLines.toLocaleString();
  $('statFunctions').textContent = DATA.complexity?.functions || 0;
  $('statClasses').textContent = DATA.complexity?.classes || 0;

  // Language bars
  renderLangBars();

  // Architecture diagram
  renderMermaid();

  // Language detailed
  renderLangDetailed();

  // Modules
  renderModules();

  // Declarations
  renderDeclarations();

  // File tree
  $('fileTreeContent').textContent = DATA.fileTree || 'No file tree data';

  // Dependencies
  renderDeps();
}

// ====== Tab Switching ======
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  $(`tab-${name}`).classList.add('active');
  document.querySelector(`.nav-item[onclick*="${name}"]`)?.classList.add('active');
}

// ====== Language Bars ======
function renderLangBars() {
  const container = $('langBars');
  if (!DATA.languages || DATA.languages.length === 0) {
    container.innerHTML = '<p style="color:var(--text2);">No language data available</p>';
    return;
  }

  container.innerHTML = DATA.languages.map((lang, i) => {
    const colorClass = COLORS[i % COLORS.length];
    const maxPct = 100;

    return `
    <div class="lang-bar-row">
      <span class="lang-bar-name">${lang.name}</span>
      <div class="lang-bar-track">
        <div class="lang-bar-fill ${colorClass}" 
             style="width: ${lang.percentage}%; max-width: ${maxPct}%;"
             data-count="${lang.count}">
        </div>
      </div>
      <span class="lang-bar-pct">${lang.percentage}%</span>
    </div>`;
  }).join('');
}

// ====== Mermaid ======
function renderMermaid() {
  if (!DATA.architectureDiagram) return;

  mermaid.initialize({
    theme: 'dark',
    themeVariables: {
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      primaryColor: '#7c5cfc',
      primaryTextColor: '#e8e8f4',
      primaryBorderColor: '#7c5cfc',
      lineColor: '#7c5cfc',
      secondaryColor: '#1a1a2e',
      tertiaryColor: '#24243e',
      background: '#0a0a12',
      mainBkg: '#1a1a2e',
      nodeBorder: '#7c5cfc',
      clusterBkg: '#12121e',
      clusterBorder: '#1e1e34',
      edgeLabelBackground: '#12121e',
      nodeTextColor: '#e8e8f4',
    }
  });

  try {
    mermaid.render('archMermaid', DATA.architectureDiagram, (svg) => {
      $('archMermaid').innerHTML = svg;
    });
  } catch(e) {
    $('archMermaid').innerHTML = '<p style="color:var(--text2);font-size:13px;">📊 Architecture diagram generated. Install mermaid for visual rendering.</p>';
  }
}

// ====== Language Detailed ======
function renderLangDetailed() {
  const container = $('langDetailed');
  if (!DATA.languages || DATA.languages.length === 0) {
    container.innerHTML = '<p style="color:var(--text2);">No data</p>';
    return;
  }

  container.innerHTML = DATA.languages.map((lang, i) => {
    const colorClass = COLORS[i % COLORS.length];
    return `
    <div class="lang-card">
      <h3>${lang.name}</h3>
      <div class="lang-count">${lang.count} files</div>
      <div class="lang-bar-micro">
        <div class="lang-bar-micro-fill ${colorClass}" style="width: ${lang.percentage}%;"></div>
      </div>
    </div>`;
  }).join('');
}

// ====== Modules ======
function renderModules() {
  const container = $('modulesList');
  if (!DATA.modules || DATA.modules.length === 0) {
    container.innerHTML = '<div class="card"><p>No module architecture detected (flat project structure)</p></div>';
    return;
  }

  container.innerHTML = `
  <div class="modules-grid">
    ${DATA.modules.map(m => `
    <div class="module-card">
      <h3>📁 ${m.name}</h3>
      <div class="module-stats">
        <div class="module-stat">📄 <strong>${m.files}</strong> files</div>
        <div class="module-stat">📝 <strong>${m.lines.toLocaleString()}</strong> lines</div>
      </div>
    </div>`).join('')}
  </div>`;
}

// ====== Declarations ======
function renderDeclarations() {
  const container = $('declarationsList');
  const decls = DATA.topDeclarations || [];

  if (decls.length === 0) {
    container.innerHTML = '<div class="card"><p>No declarations found</p></div>';
    return;
  }

  container.innerHTML = `
  <div class="card" style="overflow-x:auto;">
    <table class="decl-table">
      <thead>
        <tr>
          <th>Type</th>
          <th>Name</th>
          <th>File</th>
          <th>Line</th>
        </tr>
      </thead>
      <tbody>
        ${decls.map(d => `
        <tr>
          <td><span class="decl-type ${d.type}">${d.type}</span></td>
          <td><span class="decl-name">${d.name}</span></td>
          <td><span class="decl-file">${d.file}</span></td>
          <td style="color:var(--text3);font-size:11px;">${d.line || '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

// ====== Dependencies ======
function renderDeps() {
  const container = $('depsContent');
  const npm = DATA.dependencies?.npm || [];
  const python = DATA.dependencies?.python || [];

  if (npm.length === 0 && python.length === 0) {
    container.innerHTML = '<div class="card"><p>No package dependencies detected</p></div>';
    return;
  }

  let html = '';

  if (npm.length > 0) {
    html += `
    <div class="card">
      <h2>📦 NPM Packages</h2>
      <div class="deps-grid">
        ${npm.map(p => `
          <div class="dep-item">
            <span class="dep-name">${p.name}</span>
            <span class="dep-version">${p.version}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  if (python.length > 0) {
    html += `
    <div class="card">
      <h2>🐍 Python Dependencies</h2>
      <div class="deps-grid">
        ${python.map(p => `
          <div class="dep-item">
            <span class="dep-name">${p}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

// ====== Support Modal ======
function showSupport() {
  document.getElementById('supportModal').classList.add('show');
}

function hideSupport() {
  document.getElementById('supportModal').classList.remove('show');
}

// ====== Export ======
function exportDocs() {
  fetch('/api/docs')
    .then(r => r.text())
    .then(text => {
      const blob = new Blob([text], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${DATA.projectName || 'project'}-README.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${DATA.projectName || 'project'}-insights.json`;
  a.click();
  URL.revokeObjectURL(url);
}
