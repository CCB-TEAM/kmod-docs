
# Settings

读写在 `mod.json` 的 `settings` 里声明的用户设置，见[设置项](../../mod-format/settings.md)。

## Settings.get(id)

返回当前值：`bool` 是 boolean，`number` 是 number，`choice` 和 `string` 是 string。没设过就返回声明的 `default`（`string` 没有 `default` 时是空串）；存储的类型不对或 `choice` 值不在选项里，也返回默认值。

## Settings.set(id, value)

写入并保存，同时触发 `on_change`。**不校验**范围和选项，调用方自己保证值合法。

## Settings.on_change(fn)

`fn(id, value)`，用户在 Mods 页或通过 `settings` 指令改动设置后触发，也包括脚本自己的 `Settings.set`。

```lua
local scale = Settings.get("scale")
Settings.on_change(function(id, value)
  if id == "scale" then scale = value end
end)
```
