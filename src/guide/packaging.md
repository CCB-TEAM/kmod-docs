
# 打包成 .kmod

把模组文件夹里的**内容**（不要多套一层目录）压成 zip，扩展名改成 `.kmod`：

```bash
cd hello && zip -r ../hello-1.0.0.kmod .
```

把它放进 `kmod/mods/`（和模组文件夹放在一起），下次启动或打开 Mods 页时自动解压并加载。

- 同一个 `id` 的新包会**整体替换**旧包；`data/<id>/` 里的用户设置和 `state.json` 里的启用状态保留。
- `.kmod` 文件留在原处不动，解压出来的副本在应用的私有目录里。删掉 `.kmod` 文件，下次同步时私有副本也会删除。
- 解压失败的包，原因写在 `kmod/logs/kmod.log` 里（`cannot install ...`）；这个文件没改动之前不会反复重试。
- 同一个 `id` 既有文件夹又有 `.kmod` 时，用文件夹。
- 会被拒绝的情形：缺 `mod.json`、`format` 不是 1 或 2、`id` 无效、缺 `version`、缺 `main.lua`、依赖里的 `kmod` / `kards` 条件不满足、压缩包里有 `..` 或绝对路径。

包里允许放什么见[模组包格式](../mod-format/index.md)。
