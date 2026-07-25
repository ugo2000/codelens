/**
 * CodeLens — Codebase Scanner
 * Recursively scans directories, parses files, and extracts structural information.
 * Zero external dependencies for core scanning.
 */

const fs = require('fs');
const path = require('path');

// Language detection by extension
const LANG_MAP = {
  '.js':    { name: 'JavaScript', type: 'dynamic' },
  '.jsx':   { name: 'JSX', type: 'dynamic' },
  '.ts':    { name: 'TypeScript', type: 'static' },
  '.tsx':   { name: 'TSX', type: 'static' },
  '.py':    { name: 'Python', type: 'dynamic' },
  '.rb':    { name: 'Ruby', type: 'dynamic' },
  '.go':    { name: 'Go', type: 'static' },
  '.rs':    { name: 'Rust', type: 'static' },
  '.java':  { name: 'Java', type: 'static' },
  '.c':     { name: 'C', type: 'static' },
  '.cpp':   { name: 'C++', type: 'static' },
  '.h':     { name: 'C/C++ Header', type: 'static' },
  '.hpp':   { name: 'C++ Header', type: 'static' },
  '.cs':    { name: 'C#', type: 'static' },
  '.swift': { name: 'Swift', type: 'static' },
  '.kt':    { name: 'Kotlin', type: 'static' },
  '.php':   { name: 'PHP', type: 'dynamic' },
  '.vue':   { name: 'Vue', type: 'frontend' },
  '.html':  { name: 'HTML', type: 'markup' },
  '.css':   { name: 'CSS', type: 'style' },
  '.scss':  { name: 'SCSS', type: 'style' },
  '.less':  { name: 'Less', type: 'style' },
  '.json':  { name: 'JSON', type: 'data' },
  '.yaml':  { name: 'YAML', type: 'data' },
  '.yml':   { name: 'YAML', type: 'data' },
  '.toml':  { name: 'TOML', type: 'data' },
  '.md':    { name: 'Markdown', type: 'doc' },
  '.sql':   { name: 'SQL', type: 'data' },
  '.sh':    { name: 'Shell', type: 'script' },
  '.ps1':   { name: 'PowerShell', type: 'script' },
  '.bat':   { name: 'Batch', type: 'script' },
  '.dockerfile': { name: 'Dockerfile', type: 'config' },
  '.yml':   { name: 'YAML', type: 'data' },
};

// Skip common non-source directories
const SKIP_DIRS = new Set([
  'node_modules', '.git', '.svn', '__pycache__', 'venv', '.venv',
  'env', '.env', 'dist', 'build', '.next', '.nuxt', 'target',
  'vendor', '.idea', '.vscode', 'coverage', '.nyc_output',
  'bower_components', 'jspm_packages', '.gem', '.bundle'
]);

// Skip common non-source files
const SKIP_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.DS_Store',
  'thumbs.db', 'desktop.ini', '.gitignore', '.gitkeep'
]);

function getFileLang(ext) {
  return LANG_MAP[ext.toLowerCase()] || null;
}

function shouldScanDir(dirname) {
  return !SKIP_DIRS.has(dirname);
}

function shouldScanFile(filename) {
  return !SKIP_FILES.has(filename) && !filename.startsWith('.');
}

/**
 * Extract function/class/method names from a file using regex patterns.
 * Lightweight static analysis — no AST parser needed.
 */
function extractDeclarations(content, lang) {
  const decls = [];
  const patterns = {
    // Function declarations
    function: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/g,
    // Arrow functions in const/let
    arrow: /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(/g,
    // Class declarations
    class: /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g,
    // Method shorthand in objects/classes
    method: /(\w+)\s*\([^)]*\)\s*\{/g,
    // Python def/class
    python_def: /(?:async\s+)?def\s+(\w+)\s*\(/g,
    python_class: /class\s+(\w+)/g,
    // Go func
    go_func: /func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(/g,
  };

  if (lang === 'Python') {
    let m;
    while ((m = patterns.python_def.exec(content)) !== null) {
      decls.push({ type: 'function', name: m[1], line: content.substring(0, m.index).split('\n').length });
    }
    while ((m = patterns.python_class.exec(content)) !== null) {
      decls.push({ type: 'class', name: m[1], line: content.substring(0, m.index).split('\n').length });
    }
  } else if (lang === 'Go') {
    let m;
    while ((m = patterns.go_func.exec(content)) !== null) {
      decls.push({ type: 'function', name: m[1], line: content.substring(0, m.index).split('\n').length });
    }
  } else {
    // General JS/TS/etc
    let m;
    while ((m = patterns.function.exec(content)) !== null) {
      decls.push({ type: 'function', name: m[1], line: content.substring(0, m.index).split('\n').length });
    }
    while ((m = patterns.arrow.exec(content)) !== null) {
      decls.push({ type: 'function', name: m[1], line: content.substring(0, m.index).split('\n').length });
    }
    while ((m = patterns.class.exec(content)) !== null) {
      decls.push({ type: 'class', name: m[1], line: content.substring(0, m.index).split('\n').length });
    }
  }

  return decls;
}

/**
 * Extract comments from a file.
 */
function extractComments(content, ext) {
  const comments = [];
  const lines = content.split('\n');
  
  let inBlock = false;
  let blockBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (inBlock) {
      blockBuffer.push(line);
      if (line.includes('*/')) {
        inBlock = false;
        comments.push({ type: 'block', text: blockBuffer.join('\n'), line: lineNum - blockBuffer.length + 1 });
        blockBuffer = [];
      }
      continue;
    }

    // Single line comments
    const singleMatch = line.match(/\/\/(.+)/);
    if (singleMatch) {
      comments.push({ type: 'line', text: singleMatch[1].trim(), line: lineNum });
      continue;
    }

    // Python-style comments
    const pyMatch = line.match(/^\s*#(.+)/);
    if (pyMatch) {
      comments.push({ type: 'line', text: pyMatch[1].trim(), line: lineNum });
      continue;
    }

    // Block comment start
    if (line.includes('/*')) {
      blockBuffer = [line];
      if (!line.includes('*/')) {
        inBlock = true;
      } else {
        comments.push({ type: 'block', text: line, line: lineNum });
        blockBuffer = [];
      }
    }
  }

  return comments;
}

/**
 * Recursively scan a directory and build a project tree.
 */
function scanDirectory(dirPath, relativePath = '') {
  const entries = [];
  let totalLines = 0;
  let totalFiles = 0;
  const langCounts = {};
  const declarations = [];
  const dependencies = {};

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      const relPath = relativePath ? `${relativePath}/${item.name}` : item.name;

      if (item.isDirectory()) {
        if (!shouldScanDir(item.name)) continue;
        const subResult = scanDirectory(fullPath, relPath);
        entries.push({
          type: 'directory',
          name: item.name,
          path: relPath,
          children: subResult.entries,
          fileCount: subResult.totalFiles,
          lineCount: subResult.totalLines
        });
        totalLines += subResult.totalLines;
        totalFiles += subResult.totalFiles;
        Object.assign(langCounts, subResult.langCounts);
        declarations.push(...subResult.declarations);
      } else if (item.isFile()) {
        if (!shouldScanFile(item.name)) continue;
        const ext = path.extname(item.name);
        const lang = getFileLang(ext);
        let lineCount = 0;
        let fileComments = [];
        let fileDecls = [];

        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          lineCount = content.split('\n').length;
          fileComments = extractComments(content, ext);
          fileDecls = lang ? extractDeclarations(content, lang.name) : [];
          totalLines += lineCount;

          // Collect dependencies if relevant
          if (item.name === 'package.json') {
            try {
              const pkg = JSON.parse(content);
              dependencies.package = {
                name: pkg.name || 'unknown',
                version: pkg.version || '0.0.0',
                deps: { ...pkg.dependencies, ...pkg.devDependencies } || {}
              };
            } catch(e) {}
          }
          if (item.name === 'requirements.txt') {
            const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
            dependencies.python = lines.map(l => l.trim().split('==')[0]).filter(Boolean);
          }
          if (item.name === 'go.mod') {
            const lines = content.split('\n').filter(l => l.startsWith('\trequire'));
            dependencies.go = lines.map(l => l.trim());
          }
        } catch (e) {
          // Binary or unreadable file, skip
        }

        if (lang) {
          langCounts[lang.name] = (langCounts[lang.name] || 0) + 1;
        }

        declarations.push(...fileDecls.map(d => ({ ...d, file: relPath })));

        entries.push({
          type: 'file',
          name: item.name,
          path: relPath,
          ext,
          lang: lang?.name || 'Unknown',
          langType: lang?.type || 'unknown',
          lines: lineCount,
          comments: fileComments,
          size: item.isFile() ? fs.statSync(fullPath).size : 0
        });

        totalFiles++;
      }
    }
  } catch (e) {
    // Permission error or deleted during scan
    entries.push({ type: 'error', name: relativePath || dirPath, error: e.message });
  }

  return { entries, totalFiles, totalLines, langCounts, declarations, dependencies };
}

/**
 * Main scan entry point.
 */
function scanProject(rootDir) {
  const startTime = Date.now();
  const absRoot = path.resolve(rootDir);

  if (!fs.existsSync(absRoot)) {
    throw new Error(`Directory not found: ${absRoot}`);
  }

  const stats = scanDirectory(absRoot, '');
  const elapsed = Date.now() - startTime;

  return {
    rootPath: absRoot,
    projectName: path.basename(absRoot),
    scannedAt: new Date().toISOString(),
    scanTimeMs: elapsed,
    ...stats
  };
}

module.exports = { scanProject, scanDirectory, extractDeclarations, extractComments, getFileLang };
