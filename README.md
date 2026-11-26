# kmod loader 文档

[kmod loader](https://github.com/CCB-TEAM/KMod-Loader-Android)（KARDS 的 Lua / C++ 模组加载器，有 [Android 版](https://github.com/CCB-TEAM/KMod-Loader-Android) 和 [Windows 版](https://github.com/CCB-TEAM/KMod-Loader-Windows)）的文档。
站点：<https://CCB-TEAM.github.io/kmod-docs/>

用 [VitePress](https://vitepress.dev/) 构建，GitHub Actions 在每次推送到 `main` 后自动构建并发布到 GitHub Pages。

## 本地预览

需要 Node.js 20 以上。

```bash
npm ci
npm run dev        # 边改边看
npm run build      # 检查能否构建（死链会报错）
```

## 写文档

- 页面是 `src/` 下的 Markdown。**新增页面要在 `.vitepress/sidebar.mjs` 里加一行**，否则侧栏里没有它。
- 页面之间用相对路径链接，如 `[钩子](../concepts/hooks.md)`。
- 提示框用 GitHub 的写法：`> [!NOTE]`、`> [!TIP]`、`> [!WARNING]`、`> [!IMPORTANT]`、`> [!CAUTION]`，下一行起写内容（每行以 `> ` 开头）。
- Markdown 里的 HTML 不会生效（正文里可以直接写 `<游戏>` 这样的占位符）。
- 站点配置在 `.vitepress/config.mts`，样式在 `.vitepress/theme/kmod.css`。

## 发布设置

仓库的 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。
