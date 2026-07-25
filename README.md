<div align="center">

  <h1>🔍 CodeLens</h1>
  <p><strong>AI-Powered Codebase Intelligence Tool</strong></p>

  [![MIT License](https://img.shields.io/badge/license-MIT-green)]()
  [![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen)]()
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)]()
  [![Sponsor](https://img.shields.io/badge/sponsor-%E2%9D%A4%EF%B8%8F-pink)]()

  <p><em>Automatically analyze, document, and visualize any codebase — in seconds.</em></p>

  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-commands">Commands</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-why-codelens">Why CodeLens</a> •
  <a href="#%EF%B8%8F-support">Support</a>

  <br><br>

  <img src="https://via.placeholder.com/800x400/1a1a2e/7c5cfc?text=CodeLens+Dashboard" width="600" alt="CodeLens Dashboard">

</div>

---

## ✨ Features

CodeLens scans any codebase and automatically generates:

| Feature | Description |
|:--------|:------------|
| **📊 Project Overview** | Total files, lines, language distribution, complexity metrics |
| **🔤 Language Breakdown** | Visual distribution chart with file counts per language |
| **🏗️ Architecture Diagram** | Auto-generated Mermaid.js architecture diagram |
| **🔑 Key Definitions** | All functions, classes, and declarations indexed with file locations |
| **📁 File Tree** | Complete directory structure with file sizes and types |
| **📦 Dependencies** | NPM, Python, Go dependencies extracted automatically |
| **📄 Documentation Export** | Full Markdown README generation for any project |

### Auto-detects

```
JavaScript  • TypeScript  • Python  • Go  • Rust  • Java  • C/C++  • C#  • Ruby  • Swift
Kotlin      • PHP         • Vue     • HTML • CSS   • SCSS • SQL   • Shell • YAML  • JSON
```

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g codelens

# Or run directly with npx
npx codelens analyze /path/to/your/project

# Launch interactive dashboard
npx codelens serve /path/to/your/project
```

### No installation required

```bash
git clone https://github.com/user/codelens.git
cd codelens
npm install
```

---

## 📟 Commands

### `codelens analyze [path]`

Scans a codebase and generates comprehensive documentation.

```bash
codelens analyze ./my-project

# Output saved to: /path/to/project/.codelens/
#   📄 README.generated.md
#   📄 insights.json
#   📄 architecture.mermaid
```

### `codelens serve [path]`

Launches an interactive web dashboard.

```bash
codelens serve ./my-project
# → http://localhost:6789
```

### `codelens init`

Creates `.codelensrc.json` configuration file.

---

## 🖥️ Screenshots

```
┌─────────────────────────────────────────────┐
│  🔍 CodeLens v1.0                           │
│  AI-Powered Codebase Intelligence           │
│─────────────────────────────────────────────│
│  📂 Scanning: /path/to/project              │
│                                             │
│  ✅ 127 files, 15,234 lines scanned         │
│  🏷️  Web Backend  |  Primary: TypeScript    │
│                                             │
│  Languages:                                 │
│    TypeScript   ████████████░░░░ 62 files    │
│    JavaScript   ██████░░░░░░░░░░ 28 files    │
│    CSS          ██░░░░░░░░░░░░░░ 10 files    │
│    ...                                       │
│                                             │
│  Key Definitions:                           │
│    function   handleSubmit            ...   │
│    class      ApiClient               ...   │
└─────────────────────────────────────────────┘
```

---

## 🧩 Why CodeLens?

Developers spend **30-40% of their time** reading and understanding unfamiliar code. CodeLens eliminates that overhead.

- **Onboard faster**: New team members understand the codebase in minutes
- **Open source clarity**: Automatically generate READMEs for any repo
- **Legacy code rescue**: Document that old project you inherited
- **Code review prep**: See the architecture before diving into changes

### Who is it for?

- **👨‍💻 Developers**: Understand any codebase instantly
- **📚 Tech Writers**: Generate documentation scaffolding
- **🏢 Teams**: Standardize project documentation
- **🎓 Students**: Learn codebase architecture patterns

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

### Development

```bash
git clone https://github.com/user/codelens.git
cd codelens
npm install
npm run test  # Analyze itself!
npm run serve # Open interactive dashboard
```

---

## ❤️ Support

If CodeLens helps you or your team, please consider supporting its development:

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=for-the-badge&logo=github)](https://github.com/sponsors/user)
[![ko-fi](https://img.shields.io/badge/ko--fi-Buy_Me_Coffee-FF5E5B?style=for-the-badge&logo=ko-fi)](https://ko-fi.com/user)
[![PayPal](https://img.shields.io/badge/PayPal-Donate-00457C?style=for-the-badge&logo=paypal)](https://paypal.me/user)

</div>

Every contribution — code, issue reports, feature ideas, or financial support — helps make CodeLens better for everyone.

**Star ⭐ the repo** — it helps more people discover the project!

---

<div align="center">
  <sub>Built with ❤️ for the open source community · MIT Licensed</sub>
</div>
