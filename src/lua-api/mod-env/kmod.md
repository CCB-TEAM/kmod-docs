
# kmod

只读的加载器信息和几个工具。

| 字段 | 说明 |
|---|---|
| `kmod.version` | 加载器版本，如 `"0.4.0"` |
| `kmod.api` | 接口级别，整数 |
| `kmod.flavor` | `"dev"` 或 `"release"` |
| `kmod.game` | 游戏版本，只含前两段，如 `"1.61"`；读不到时为 `nil` |
| `kmod.game_version` | 完整的游戏版本，如 `"1.61.27596"`；读不到时为 `nil` |
| `kmod.version_satisfies(have, cond)` | 版本比较，如 `kmod.version_satisfies("1.101", ">=1.61")` → `true` |
| `kmod.max_errors` | 自动禁用的错误次数阈值（10） |
| `kmod.paths` | 路径表：`files`、`root`（`kmod/`）、`mods`（`kmod/mods/`，用户放模组的地方）、`private`（应用私有的 kmod 目录，模组从 `<private>/mods` 加载）、`dev`、`logs` |
| `kmod.tree(widget, depth)` / `kmod.print_tree(widget, depth)` | 打印控件树，调试界面用 |

## 函数

| 函数 | 说明 |
|---|---|
| `kmod.reload_mods()` | 重新加载全部模组 |
| `kmod.reload_mod(id)` | 只重新加载一个 Lua 模组：撤销它注册的钩子、定时器、新对象监听、工作线程、网络请求和连接、窗口、事件监听、控制台指令，重新读它的文件夹并运行 `main.lua`。返回 `true`，或 `false` 加原因。带 C++ 部分的模组不能单独重载（原生库要重启游戏才卸载）。依赖它的其他模组不会跟着重载 |
| `kmod.base64(bytes)` | 把一段二进制字符串编码成 base64 |
| `kmod.gif_frames(src, outDir, maxSide, maxFrames [, cropX, cropY, cropSide])` | 把 GIF 拆成 `outDir/f001.png`、`f002.png`……，返回 `{ width, height, delays = { 每帧毫秒 } }`，失败返回 `nil, 原因`。见下 |

### kmod.gif_frames

- `src` 必须在 `kmod/` 里；`outDir` 在 `kmod/` 或应用私有目录（`kmod.paths.private`）里，并且要先建好。放私有目录的帧不会出现在手机相册里。
- `maxSide`：帧的最长边，默认 480（32 到 1024）。`maxFrames`：最多输出几帧，默认 60（1 到 200）；超过时隔帧抽取，时长合并，总时长不变。
- `cropX, cropY, cropSide`：只保留原图里这个正方形区域（原图像素）。
- 解码是同步的，大图会让游戏停顿一下；结果可以缓存起来重复使用。

开发版额外有 `kmod.debug_crash("segv")` 和 `kmod.debug_crash("abort")`，主动制造崩溃，用于测试崩溃日志；正式版没有。

> [!NOTE]
> `kmod` 表里还有以下划线开头的内部字段（`kmod._status` 等）和加载器自己用的函数，它们不属于公开接口，随时可能改动。
