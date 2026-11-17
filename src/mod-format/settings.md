
# 设置项

在 `mod.json` 的 `settings` 里声明，Mods 页会为每一项生成控件。用户的值存在 `kmod/data/<id>/settings.json`。

| 类型 | 字段 | 控件 |
|---|---|---|
| `bool` | `default` | 勾选框 |
| `number` | `min` `max` `step` `default` | 滑块，范围任意（已实测 0–100 步长 5） |
| `choice` | `options` `default` | 下拉框。`options` 是**稳定的值**（如 `"low"`），保存的也是这个值；显示文字走本地化，换语言不会丢设置 |
| `string` | `default` `maxlen` | 文本输入框（游戏自带的输入控件，点它会弹出系统键盘）。提交（失去焦点或回车）时保存；`maxlen` 可选，超出会被截断 |

每一项都有 `id` 和 `label`（默认显示文字，可被本地化覆盖）。存储的值类型不对（比如被手改成数字）时，读出来是默认值；`choice` 的值不在 `options` 里也是默认值。

## 在脚本里读写

```lua
local scale = Settings.get("scale")
Settings.on_change(function(id, value)
  Log.info(id .. " = " .. tostring(value))
end)
```

见 [Settings](../lua-api/mod-env/settings.md)。也可以用控制台指令 `settings <模组id> [键 [值]]` 读写。
