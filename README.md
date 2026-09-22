# 灵感口袋 · Prompt Pocket

从零制作的提示词产品展示页。包含 12 条原创中文提示词，支持分类、搜索、展开、复制、本机收藏和新增。

## 本地运行

安装 Node.js 18 或更高版本，在项目目录运行：

```sh
npm run dev
```

打开 `http://localhost:5173`。不需要安装第三方依赖。结束时按 Ctrl+C。

## 网页文件

`public/` 是可直接发布的完整静态网站目录。无构建步骤，无服务器接口，无密钥、登录、数据库或付费 API。相对资源路径兼容 GitHub Pages 项目网址。

本项目的 Node.js 服务仅用于本地预览，云端托管不需要运行它。

## 数据与能力边界

- 收藏和自建提示词仅保存在当前浏览器、当前网站地址对应的 localStorage 中。
- 不上传用户内容，不提供云同步；清理网站数据会删除保存内容。
- 三个平台使用不同网址，收藏互不共享。
- 页面负责展示、整理与复制提示词；不直接调用 AI。
- 原创教学演示，无交易、注册或用户信息收集。

## 发布

- Cloudflare Quick Tunnels：本地服务启动后运行 `cloudflared tunnel --url http://localhost:5173`。本地服务、隧道和网络需持续运行。
- Netlify：发布目录为 `public`，无构建命令。可使用 Netlify Drop 上传整个 `public` 文件夹，或使用 CLI。
- GitHub Pages：源码保存在 `main` 分支，`public` 目录的网页文件单独发布到 `gh-pages` 分支根目录。在仓库 Settings → Pages 中选择从 `gh-pages` 分支的 `/ (root)` 发布；发布记录可在 Actions 中查看。

更新网页后，在项目目录提交源码，再运行：

```sh
git push origin main
git subtree split --prefix public -b pages-release
git push origin pages-release:gh-pages
git branch -D pages-release
```

这里的 `pages-release` 是用于提取网页文件的临时本地分支；发布分支只包含 `public` 中的静态文件。

部署后请用未登录窗口检查页面、图片和交互，并在实际目标网络测试访问。

## 设计素材

`public/assets/hero.png` 使用内置图像生成工具制作，生成提示词位于 `design/hero-prompt.txt`。
