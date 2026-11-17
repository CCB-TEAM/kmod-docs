
# UI

用游戏自己的控件（按钮、开关、滑条、文本框、下拉框）搭独立窗口，外观和游戏设置页一致。

```lua
local win = UI.window{ title = "我的模组", width = 900 }
local status = win:label("还没有操作")
win:button("点我", function() status:set_text("点了一下") end)
win:toggle("开关", true, function(on) Log.info("开关 = " .. tostring(on)) end)
win:slider("音量", 0, 10, 3, function(v) status:set_text(string.format("%.1f", v)) end)
win:input("名字", "hello", function(text) Log.info("输入：" .. text) end)
win:choice("模式", { "一", "二", "三" }, "二", function(option) Log.info(option) end)
```

## UI.window(opts)

创建窗口，默认立即显示。窗口居中，带标题栏和关闭按钮（X），内容区超过最大高度时可以滚动。

| 选项 | 默认 | 说明 |
|---|---|---|
| `title` | 空 | 标题 |
| `width` | 900 | 宽度（界面单位，随游戏的 UI 缩放） |
| `max_height` | 640 | 内容区最大高度，超出滚动 |
| `show` | `true` | `false` 时先隐藏，用 `win:show()` 显示 |
| `on_close` | 无 | 玩家点 X 关闭后调用 |

## 窗口方法

| 方法 | 说明 |
|---|---|
| `win:label(text)` | 一行文字。返回 `{ set_text(self, text) }` |
| `win:button(text, fn)` | 按钮，点击调用 `fn()`。返回 `{ set_text }` |
| `win:toggle(label, value, fn)` | 开关，变化时 `fn(on)`。返回 `{ get(), set(self, v) }` |
| `win:slider(label, min, max, value, fn [, step])` | 滑条，变化时 `fn(value)`。返回 `{ get(), set(self, v) }` |
| `win:input(label, value, fn)` | 文本框，**提交时**（回车或失去焦点）`fn(text)`。返回 `{ get(), set }` |
| `win:choice(label, options, selected, fn)` | 下拉框，`options` 是字符串列表，选中时 `fn(option)`。返回 `{ get() }` |
| `win:spacer([height])` | 空白 |
| `win:clear()` | 删除所有控件 |
| `win:show()` / `win:hide()` / `win:toggle_visible()` | 显示、隐藏、切换 |
| `win:is_open()` | 当前是否显示 |
| `win:close()` | 销毁窗口，之后不能再用 |

`set(...)` 修改控件的值时**不会**触发它的回调。

## UI.toast(text [, seconds])

屏幕上方的一条提示，默认 3 秒，不挡触摸。同时只有一条，新的会替换旧的。

## 说明

- **何时能用**：需要游戏已经有 `PlayerController`（进入游戏界面之后）。太早调用会抛错 `UI: the game is not ready yet`。可以在 `ExecuteWithDelay` 或 `Events` 里创建。
- **生命周期**：模组重新加载或被禁用时，它的窗口自动销毁。
- **回调里的错误**会写日志并计入模组的错误数（累计 10 次自动停用）；回调里崩溃，会被记在这个模组名下，见[崩溃保护](../../guide/safe-mode.md)。
- **文字延迟**：游戏的控件在构建完成后才接受文字，kmod 会在创建后约 0.1 秒设置，所以刚创建的窗口可能有一瞬间显示占位字。
- **限制**：目前只有这几种控件，窗口固定居中，没有自定义布局。需要更多时，可以直接用游戏的控件类自己搭（见 Mods 页的做法）。
