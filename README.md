# kmod loader 文档

[kmod loader](https://github.com/CCB-TEAM/KMod-Loader-Android)（KARDS 的 Lua / C++ 模组加载器，目前是 Android 版）的文档。
站点：<https://CCB-TEAM.github.io/kmod-docs/>

用 [mdBook](https://rust-lang.github.io/mdBook/) 构建，GitHub Actions 在每次推送到 `main` 后自动构建并发布到 GitHub Pages。

## 本地预览

```bash
cargo install mdbook        # 或者从 mdBook 的 GitHub Releases 下载
mdbook serve --open
```

## 写文档

- 页面是 `src/` 下的 Markdown，目录结构见 `src/SUMMARY.md`：**新增页面要在 `SUMMARY.md` 里加一行**，否则不会出现在站点里。
- 页面之间用相对路径链接，如 `[钩子](../concepts/hooks.md)`。
- 提示框用 GitHub 的写法：`> [!NOTE]`、`> [!TIP]`、`> [!WARNING]`、`> [!IMPORTANT]`、`> [!CAUTION]`，下一行起写内容（每行以 `> ` 开头）。
- 样式在 `theme/kmod.css`，站点配置在 `book.toml`。

## 发布设置

仓库的 Settings → Pages → Build and deployment → Source 选 **GitHub Actions**。
