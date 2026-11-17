
# kmod

只读的加载器信息和几个工具。

| 字段 | 说明 |
|---|---|
| `kmod.version` | 加载器版本，如 `"0.3.0"` |
| `kmod.api` | 接口级别，整数 |
| `kmod.flavor` | `"dev"` 或 `"release"` |
| `kmod.game` | 游戏版本，只含前两段，如 `"1.61"`；读不到时为 `nil` |
| `kmod.game_version` | 完整的游戏版本，如 `"1.61.27596"`；读不到时为 `nil` |
| `kmod.version_satisfies(have, cond)` | 版本比较，如 `kmod.version_satisfies("1.101", ">=1.61")` → `true` |
| `kmod.max_errors` | 自动禁用的错误次数阈值（10） |
| `kmod.paths` | 路径表：`files`、`mods`、`dev`、`logs` |
| `kmod.tree(widget, depth)` / `kmod.print_tree(widget, depth)` | 打印控件树，调试界面用 |

开发版额外有 `kmod.debug_crash("segv")` 和 `kmod.debug_crash("abort")`，主动制造崩溃，用于测试崩溃日志；正式版没有。

> [!NOTE]
> `kmod` 表里还有以下划线开头的内部字段（`kmod._status` 等）和加载器自己用的函数，它们不属于公开接口，随时可能改动。
