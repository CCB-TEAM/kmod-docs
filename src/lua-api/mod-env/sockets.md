
# WebSocket 与 Socket

模组自己的长连接：WebSocket 客户端、TCP（可选 TLS）和 UDP。每个连接在自己的线程里运行，**不卡游戏**；回调在游戏线程里调用。

需要在 `mod.json` 里声明网络权限（和 [`Http`](http.md) 相同）：`"permissions": ["network"]`。

## WebSocket

```lua
local ws
ws = WebSocket.connect("wss://example.com/live", {
  headers = { Authorization = "Bearer ..." },          -- 可选，握手时发送
  on_open    = function() ws:send("hello") end,
  on_message = function(text, is_binary) Log.info(text) end,
  on_close   = function(code, reason) Log.info("closed " .. code) end,
  on_error   = function(message) Log.warn(message) end,
})
```

| 方法 | 说明 |
|---|---|
| `ws:send(text)` | 发送文本帧 |
| `ws:send_binary(data)` | 发送二进制帧 |
| `ws:close()` | 正常关闭（状态码 1000） |
| `ws:is_open()` | 是否已连上且未关闭 |

- `ws://` 和 `wss://` 都支持；`wss://` 用系统证书并**检查主机名**。
- 握手会校验服务器返回的 `Sec-WebSocket-Accept`。分片消息自动重组；服务器的 ping 自动回 pong。
- `on_close(code, reason)`：服务器主动关闭时是它给的状态码和原因（如 `1001 going away`）；网络断开是 `1006`。
- 单条消息最多 16 MB。

## TCP

```lua
local s
s = Socket.tcp("example.com", 443, {
  tls = true,                                          -- 可选，默认明文
  on_open  = function() s:send("GET / HTTP/1.0\r\nHost: example.com\r\n\r\n") end,
  on_data  = function(bytes) ... end,                  -- 收到多少给多少，不保证按行
  on_close = function(code, reason) end,
  on_error = function(message) end,
})
```

`s:send(data)`、`s:close()`、`s:is_open()`。TLS 同样用系统证书并检查主机名：连到证书对不上的主机会收到 `on_error`。

## UDP

```lua
local u
u = Socket.udp("8.8.8.8", 53, { on_data = function(bytes) ... end, on_error = function(m) end })
u:send(packet)
```

是"已连接"的 UDP：只和你给的那个地址收发。

## 通用说明

- `timeout`（毫秒，1000–60000，默认 15000）限制连接和握手。
- 同时最多 16 个连接。模组重新加载或禁用时，它的所有连接自动关闭。
- 回调里抛错会写日志并计入模组错误数。
- 和 `Http` 一样，`permissions` 是声明，不是沙箱，见 [Http 的说明](http.md)。
