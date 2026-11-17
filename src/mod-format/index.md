
# 模组包格式（format 1 和 2）

一个包 = 一个文件夹；本地化可选，不写也能用。

```
hello_mod/                 # 文件夹名 = 模组 id
├── mod.json               # 清单（必需）
├── main.lua               # 入口（必需）
├── lang/                  # 本地化（可选）
│   ├── en.json
│   └── zh-CN.json
└── ...                    # 其余 Lua 模块、数据文件，随意
```

- **分发形式**：把文件夹里的内容打成 zip，扩展名改成 `.kmod`，详见[打包](../guide/packaging.md)。
- **安装**：解压到 `kmod/mods/<id>/`；直接放一个文件夹进去效果一样。包视为只读，升级 = 整个替换。
- **用户数据**：`kmod/data/<id>/settings.json`，和包分开，升级不会丢。

## mod.json

```json
{
  "format": 2,
  "platform": ["Windows", "Android"],
  "id": "hello_mod",
  "name": "Hello Mod",
  "version": "1.0.0",
  "author": "kmod",
  "description": "A demo mod.",
  "depends": ["kmod>=0.2.0", "kards>=1.61"],
  "settings": [
    {"id":"verbose","type":"bool","label":"Verbose log","default":false},
    {"id":"scale","type":"number","label":"Scale","min":0.5,"max":2,"step":0.25,"default":1},
    {"id":"mode","type":"choice","label":"Mode","options":["low","medium","high"],"default":"medium"},
    {"id":"nick","type":"string","label":"Nickname","default":"Bob","maxlen":12}
  ]
}
```

| 字段 | 必需 | 说明 |
|---|---|---|
| `format` | 是 | 包格式版本：1 或 2。用了 `platform`（或原生库）的包写 2，只认识 1 的旧加载器会直接拒绝它，而不是在错误的平台上运行 |
| `platform` | 否 | 支持的平台：`"Android"`、`"Windows"` 或列表 `["Windows", "Android"]`（不区分大小写）。**没有这个字段 = 所有平台**，纯 Lua 模组一般不用写。当前平台不在列表里时，模组不会加载，Mods 页显示"不适用于本平台"，也不能启用。带原生库的模组必须声明它为哪些平台编译 |
| `id` | 是 | 小写字母、数字、下划线（`^[a-z0-9_]+$`）；必须和文件夹名一致 |
| `version` | 是 | 版本号，供依赖检查和显示 |
| `name` | 否 | 默认显示名（通常英文）；缺省用 id |
| `author` | 否 | 作者 |
| `description` | 否 | 说明，显示在 Mods 页该模组的版本行上方；有 `lang` 翻译时用翻译 |
| `api` | 否 | 需要的加载器接口级别，高于当前（`kmod.api`）就拒绝加载。新模组建议改用 `kmod>=x.y.z` |
| `depends` | 否 | 依赖列表，见[依赖与版本条件](dependencies.md) |
| `native` | 否 | C++ 模组的库文件名，在包里的 `native/arm64-v8a/` 下找。必须同时是 `"format": 2` 并写 `platform`；有 `native` 时 `main.lua` 可以没有。见 [C++ 模组](../guide/native-mods.md) |
| `permissions` | 否 | 权限声明列表。目前只有 `"network"`：允许使用 [`Http`](../lua-api/mod-env/http.md)、[WebSocket 与 Socket](../lua-api/mod-env/sockets.md)；`"game_network"`：允许使用 [`Net`](../lua-api/mod-env/net.md)（观察和修改游戏自己的 WebSocket 消息）。不认识的权限会被忽略并警告 |
| `settings` | 否 | 设置项，见[设置项](settings.md) |

## 从旧布局迁移

加载器会自动兼容并迁移：

| 旧布局 | 新格式 | 说明 |
|---|---|---|
| `Scripts/main.lua` | `main.lua` | 没有根目录 `main.lua` 时仍读 `Scripts/main.lua`，并警告 |
| `<mod>/enabled.txt` | `state.json` 的 `enabled` | 首次启动自动迁移，然后删除旧文件 |
| `<mod>/settings.json` | `data/<id>/settings.json` | 首次启动自动搬移 |
| `choice` 保存选项文字 | 保存稳定值 | 旧值等于某个选项时沿用 |
| `mod.json` 无 `id` | 必须有 `id` | 缺省时取文件夹名并警告 |
