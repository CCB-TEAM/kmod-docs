# UI.web

用 HTML / CSS / JavaScript 写界面：模组带一个网页，加载器把它放进游戏自带的浏览器控件里，显示成一个**无边框、背景透明**的窗口。页面和 Lua 之间用消息通信。

```lua
local w = UI.web{
  dir = "ui", width = 860, height = 520,
  min_width = 480, min_height = 320,
  on_ready = function() w:send({ cmd = "hello", platform = kmod.platform }) end,
  on_message = function(msg)
    if msg.cmd == "ping" then w:send({ cmd = "pong", t = msg.t }) end
  end,
}
```

页面（`ui/index.html`）：

```html
<div id="bar">我的窗口 <button onclick="kmod.close()">×</button></div>
<button onclick="kmod.send({ cmd: 'ping', t: Date.now() })">ping</button>
<div id="grip"></div>
<script>
  kmod.onmessage = function (m) { console.log(m); };
  kmod.dragMove(document.getElementById('bar'));     // 拖标题栏移动窗口
  kmod.dragResize(document.getElementById('grip'));  // 拖角落缩放窗口
</script>
```

## UI.web(opts)

创建窗口，默认立即显示。需要游戏已经有 `PlayerController`（和 `UI.window` 一样，太早调用会抛错）。

| 选项 | 默认 | 说明 |
|---|---|---|
| `dir` | 无 | 模组里存放页面的文件夹（相对模组目录，不能有 `..`）。与 `html` 二选一 |
| `entry` | `index.html` | `dir` 里的入口文件 |
| `html` | 无 | 直接给一段 HTML 文字 |
| `width`、`height` | 860、520 | 窗口大小（界面单位，随游戏的 UI 缩放） |
| `min_width`、`min_height` | 160、100 | 窗口最小尺寸，拖拽缩放和 `set_size` 都不会小于它 |
| `max_width`、`max_height` | 8000、8000 | 窗口最大尺寸。设反了（最大小于最小）时以最小为准 |
| `design_width` | `width` | 页面的设计宽度，见下面「页面尺寸」 |
| `position` | `"center"` | `center`、`top`、`bottom`、`left`、`right`、`top-left`、`top-right`、`bottom-left`、`bottom-right`，或 `{x, y}`（0 到 1 的比例） |
| `x`、`y` | 0 | 相对 `position` 的偏移（界面单位） |
| `fullscreen` | `false` | 铺满整个屏幕（没有大小限制，也不能缩放） |
| `transparent` | `true` | 页面背景透明，可以画圆角和阴影。设为 `false` 则不透明 |
| `show` | `true` | `false` 时先隐藏，用 `w:show()` 显示 |
| `on_ready` | 无 | 页面加载完、可以收发消息时调用 |
| `on_message` | 无 | 页面发来消息时调用 `fn(msg)`，`msg` 是页面 `kmod.send` 的对象 |
| `on_close` | 无 | 窗口被关闭时调用（页面调用 `kmod.close()`，或游戏切换场景把它销毁） |

## 窗口方法

| 方法 | 说明 |
|---|---|
| `w:send(tbl)` | 给页面发一条消息，页面的 `kmod.onmessage(obj)` 收到。窗口已销毁时返回 `false` |
| `w:set_size(w, h)` | 改窗口大小（会被最小、最大尺寸限制），保持窗口的锚点不动 |
| `w:set_position(x, y)` | 改位置（相对 `position` 的偏移） |
| `w:show()` / `w:hide()` | 显示、隐藏（页面保持运行） |
| `w:close()` | 销毁窗口，之后不能再用 |
| `w:is_open()` | 当前是否显示 |

## 页面里的 `kmod` 对象

加载器在每个页面最前面加了一段脚本，提供全局的 `kmod`：

| 成员 | 说明 |
|---|---|
| `kmod.send(obj)` | 发一条消息给 Lua 的 `on_message` |
| `kmod.onmessage = function (obj) {}` | 接收 Lua 用 `w:send` 发来的消息 |
| `kmod.close()` | 关闭窗口 |
| `kmod.dragMove(el)` | 让元素成为「拖动手柄」：按住它拖动，整个窗口跟着移动。元素里加 `data-nodrag` 属性的子元素（比如按钮）不触发拖动 |
| `kmod.dragResize(el)` | 让元素成为「缩放手柄」：按住它拖动改变窗口大小（受最小、最大尺寸限制） |
| `kmod.move(x, y)` / `kmod.resize(w, h)` | 直接设位置、大小 |
| `kmod.state()` | `{ x, y, w, h }`，窗口当前的位置和大小 |
| `kmod.unit()`、`kmod.pointer(e)` | 高级：一个 `screenX` 单位对应多少界面单位；把指针事件换算成界面单位 |

名字以 `$` 开头的消息（`$ready`、`$drag` 等）是加载器自己用的，模组的消息不要用 `cmd = "$..."`。

## 页面尺寸

- **手机**：页面按 `design_width`（默认等于窗口宽度）排版，整体缩放填满窗口。窗口变大后页面等比放大。
- **电脑**：同样按 `design_width` 缩放。拖动缩放时，页面内容会随窗口大小缩放，布局以设计宽度为准。
- 玩家不能缩放页面（双指缩放、Ctrl+滚轮、Ctrl+加减号都被禁用），右键菜单也被禁用。

## 缩放窗口时的表现

浏览器每次改变大小都要重新排版，边拖边改会很卡。所以拖动 `kmod.dragResize` 的手柄时，窗口本身**不变**，只显示一个半透明的蓝色预览框，松手后窗口一次性变成新大小。

- 电脑：预览框画在窗口上面，窗口内容还看得见。
- 手机：网页是系统原生控件，总在游戏界面上面，所以缩放时窗口内容会暂时隐藏，只剩预览框，松手后恢复。

用 `kmod.resize(w, h)` 或 `w:set_size` 直接设置大小则立即生效，没有预览框。

## 页面里的文件

`dir` 里的页面用相对路径引用的**样式表、脚本、图片、字体**会在加载时内联进页面：`<link rel="stylesheet" href="style.css">`、`<script src="app.js">`、`<img src="logo.png">`、CSS 里的 `url(font.woff2)`。

- 只支持相对路径，不能有 `..`，不能是绝对路径或带 `:` 的地址。
- 整个页面（内联后）不能超过 12 MB。图片太多太大时，页面加载会变慢。
- 页面是作为一个 `data:` 地址加载的，**不能**用 `fetch` 读本地文件。需要的数据请让 Lua 读好后用 `w:send` 发过去。

## 通信的限制

- 页面发给 Lua 的消息走窗口标题和地址栏的锚点，由加载器轮询：手机上拖动时每帧一次，其他时候每 40 毫秒一次。**消息要小**（几 KB 以内，不要传图片的数据），连续发几条时，同一个 40 毫秒内只有最后一条保证送到。
- Lua 发给页面的消息用 `ExecuteJavascript` 送，较大的消息也可以，但不要一次发太多。
- 图片等大文件：让 Lua 把文件放到页面能用的位置，或者在 `html` 里直接内联，不要走消息。

## 平台差别

| | Android | Windows |
|---|---|---|
| 浏览器 | 系统 WebView | CEF（Chromium 90） |
| 拖动、缩放 | 页面自己量手指位置，加载器每帧读消息 | 加载器读鼠标位置和左键状态 |
| 打开方式 | 模组自己决定（比如延时、按钮） | 可以配合 [`Input.on_key`](input.md) 用快捷键 |
| 缩放预览 | 窗口内容隐藏，只显示预览框 | 预览框在内容上面 |

## 说明

- **生命周期**：模组重新加载或被禁用时，它的网页窗口自动销毁。游戏切换场景会销毁控件，这时 `on_close` 会被调用，需要的话重新创建。
- **回调里的错误**会写日志并计入模组的错误数，和 `UI.window` 一样。
- 页面里的 `console.log` 看不到，调试时用 `kmod.send({ cmd = "log", ... })` 让 Lua 写日志。
- 旧版本的加载器没有 `UI.web`：先检查 `UI.web ~= nil` 再用。
