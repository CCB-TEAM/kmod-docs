
# Lang

本地化，文件格式和回退规则见[本地化](../../mod-format/localization.md)。

## Lang.t(key, vars)

按当前语言查 `lang/*.json`，把 `{name}` 这样的占位符替换成 `vars.name`。缺键返回键名本身。

```lua
Lang.t("greeting", { name = "Bob" })   -- "你好，Bob！"
```

## Lang.current()

当前语言标签，如 `"zh-CN"`。

## Lang.on_change(fn)

`fn(tag)`，游戏语言（`auto` 时）或手动选择的语言变化时触发。加载器每 2 秒检查一次语言，所以有最多约 2 秒的延迟。
