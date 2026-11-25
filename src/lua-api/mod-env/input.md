# Input

读键盘按键（只有 Windows 版有用；Android 没有键盘，永远返回 `false`，回调永远不触发）。

```lua
Input.on_key("F8", function()
  Log.info("按了 F8")
end)

if Input.is_down("CTRL+SHIFT+K") then Log.info("三个键都按着") end
```

| 函数 | 说明 |
|---|---|
| `Input.is_down(keys)` | 组合键当前是否都按着。游戏窗口没有焦点时一律是 `false` |
| `Input.on_key(keys, fn)` | 每当组合键从没按到按下，调用 `fn()`。每 40 毫秒检查一次 |

## 按键名

字母 `A`-`Z`、数字 `0`-`9`、`F1`-`F24`、`CTRL`、`SHIFT`、`ALT`、`ESC`、`ENTER`、`SPACE`、`TAB`、`INSERT`、`DELETE`、`HOME`、`END`、`PAGEUP`、`PAGEDOWN`、`UP`、`DOWN`、`LEFT`、`RIGHT`、`TILDE`。组合键用 `+` 连接，不区分大小写。鼠标左键、右键是 `LMB`、`RMB`（只能用 `is_down`）。

## 说明

- 防抖：组合键松开至少 120 毫秒后才会再次触发，避免窗口打开时焦点闪烁造成连续触发。
- `Input.on_key` 的回调在游戏线程里调用，错误处理和其他回调一样。
- 模组被停用或重新加载时，监听自动取消。
