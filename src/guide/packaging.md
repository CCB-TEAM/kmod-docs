
# 打包成 .kmod

把模组文件夹里的**内容**（不要多套一层目录）压成 zip，扩展名改成 `.kmod`：

```bash
cd hello && zip -r ../hello-1.0.0.kmod .
```

把它放进 `kmod/inbox/`，下次启动或打开 Mods 页时自动安装。

- 同一个 `id` 的新包会**整体替换**旧包；`data/<id>/` 里的用户设置和 `state.json` 里的启用状态保留。
- 安装失败的包会被移到 `inbox/failed/`，旁边的 `.txt` 写明原因。
- 会被拒绝的情形：缺 `mod.json`、`format` 不是 1 或 2、`id` 无效、缺 `version`、缺 `main.lua`、依赖里的 `kmod` / `kards` 条件不满足、压缩包里有 `..` 或绝对路径。

包里允许放什么见[模组包格式](../mod-format/index.md)。
