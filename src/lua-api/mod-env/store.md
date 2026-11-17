
# Store

模组自己的小型持久化存储，保存在 `kmod/data/<模组id>/store.json`。和 [`Settings`](settings.md) 的区别：`Settings` 是给玩家在 Mods 页里改的选项，`Store` 是模组自己记的状态（上次选择、计数、缓存之类）。

```lua
local runs = Store.get("runs", 0) + 1
Store.set("runs", runs)
```

| 函数 | 说明 |
|---|---|
| `Store.get(key, default)` | 读取，没有时返回 `default` |
| `Store.set(key, value)` | 写入并立即存盘。值可以是 `nil` 以外的 JSON 能表示的任何东西：布尔、数字、字符串、表 |

`Mod.data_dir` 是这个模组的数据目录（`kmod/data/<模组id>`），需要存别的文件时用它。更新或重装模组不会清掉这个目录。
