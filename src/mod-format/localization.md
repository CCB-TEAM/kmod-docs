
# 本地化

本地化只管**模组自己的文字**，不能替换游戏文本。不写也能用：`mod.json` 里的 `name`、`label` 就是默认文字。

## 文件

`lang/<语言>.json`，UTF-8，**扁平的键值表**：

```json
{
  "name": "测试模组",
  "description": "一个演示模组。",
  "settings.verbose.label": "详细日志",
  "settings.mode.label": "模式",
  "settings.mode.options.low": "低",
  "settings.mode.options.medium": "中",
  "settings.mode.options.high": "高",
  "greeting": "你好，{name}！"
}
```

## 保留键（界面自动使用）

| 键 | 覆盖 |
|---|---|
| `name`、`description` | 模组名、说明 |
| `settings.<id>.label` | 设置项名称 |
| `settings.<id>.options.<值>` | 下拉选项的显示文字 |

其余键随便起，给脚本用。

## 语言选择与回退

语言标签：`en`、`zh-CN`、`zh-TW`、`ja`、`ko`、`ru`、`de`、`fr`、`es`、`pt`、`pl`、`it`（正好是游戏自己的 12 种语言）。

- 当前语言默认跟随游戏语言设置（`state.json` 里 `"language":"auto"`），也可在 Mods 页顶部的语言下拉手动指定，或用 `lang` 指令。
- 查找顺序：`zh-CN` → `zh` → `en` → `mod.json` 里的默认文字 → 键名本身。所以只写 `en.json` 和 `zh-CN.json` 就够了。

## 在脚本里用

```lua
Lang.t("greeting", { name = "Bob" })   -- "你好，Bob！"；缺键返回键名
Lang.current()                          -- "zh-CN"
Lang.on_change(function(tag) end)
```

见 [Lang](../lua-api/mod-env/lang.md)。
