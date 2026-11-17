
# Mod

只读的模组信息。

| 字段 | 说明 |
|---|---|
| `Mod.id` | 模组 id |
| `Mod.name` | `mod.json` 里的 `name`（默认文字，不是翻译后的） |
| `Mod.version` | 版本号字符串 |
| `Mod.dir` | 模组目录的完整路径 |
| `Mod.data_dir` | 模组的数据目录 `kmod/data/<id>`，更新或重装模组时不会被清掉 |
| `Mod.path(rel)` | 把包内相对路径拼成完整路径，如 `Mod.path("assets/x.dat")` |

```lua
Log.info(Mod.id .. " " .. Mod.version .. " at " .. Mod.dir)
local f = io.open(Mod.path("data.txt"), "rb")
```
