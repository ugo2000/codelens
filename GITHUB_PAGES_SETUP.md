# GitHub Pages 设置步骤

## 已完成的操作

✅ `docs/` 文件夹已推送到仓库
✅ 包含静态文件：
- `index.html` — 主页面
- `style.css` — 样式
- `app.js` — 前端逻辑
- `data/scan-result.json` — 预生成的扫描数据

## 需要手动完成的步骤

1. 打开 https://github.com/ugo2000/codelens/settings/pages

2. 在 "Build and deployment" 部分：
   - Source: 选择 **Deploy from a branch**
   - Branch: 选择 **master** / **docs** 文件夹
   - 点击 **Save**

3. 等待 1-2 分钟，访问：
   **https://ugo2000.github.io/codelens/**

## 如何更新数据

运行本地扫描后，复制新数据到 docs：
```bash
node src/cli/index.js analyze .
cp .codelens/insights.json docs/data/scan-result.json
git add docs/data/scan-result.json
git commit -m "update: scan data"
git push
```

GitHub Pages 会自动更新（约 1-2 分钟）。

## 在线演示特点

- ✅ 纯前端，无需服务器
- ✅ 零依赖（除 mermaid CDN）
- ✅ 可分享链接给任何人
- ✅ 支持手机/平板访问
