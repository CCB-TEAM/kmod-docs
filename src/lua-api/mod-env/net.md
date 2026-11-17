
# 游戏自身的网络（`Net` 与服务器重定向）

这一页讲的是**游戏自己**的网络通信，而不是模组自己发请求（那是 [`Http`](http.md) 和 [WebSocket 与 Socket](sockets.md)）。

## 能做什么、不能做什么

| | |
|---|---|
| 游戏的 HTTP 请求（登录、配置、商店……） | 是引擎的原生代码，Lua 看不到。能做的是**改服务器地址**（见下面的重定向） |
| 游戏的 WebSocket **收到**的消息 | 可以观察，也可以修改 |
| 游戏的 WebSocket **发出**的消息、连接的建立 | 可以观察，也可以修改：`Net.on_send`、`Net.on_open`（见下）。`Net.send` 可以主动发 |
| 连接状态（打开、关闭、失败） | 可以观察 |

## 服务器重定向

游戏的服务器地址是写在 `libUnreal.so` 里的字符串。kmod 在库加载后立刻把它们改成你指定的地址，**不用重打包 APK**。

创建 `kmod/net/server.json`：

```json
{ "server": "http://192.168.1.5:1145" }
```

重启游戏后生效。把文件删掉（或加 `"enabled": false`）就恢复官方服务器。

- 地址必须以 `http://` 或 `https://` 开头，写**基础地址**（不要带结尾的 `/` 和 `/config`）。
- **最长 28 个字符**：原来的字符串只有这么多空间。IP 加端口通常够用（`http://192.168.100.100:1145` 是 27 个）。太长会在日志里报错，什么也不改。
- 日志里能看到结果，例如 `game server redirected to http://127.0.0.1:1145 (patched 1 + 1 + 1 string literal(s))`；Lua 里 `Net.redirect_status()` 返回同样的文字。
- WebSocket 的地址不用另外改：游戏从服务器返回的登录信息里取它。
- 只改了内存，**不改文件**；换游戏版本时按内容查找，不依赖固定偏移。

## Net

需要在 `mod.json` 里声明 `"permissions": ["game_network"]`。

```lua
Net.on_message(function(msg)
  -- msg = { channel, sender, message, context }
  Log.info(msg.channel .. ": " .. msg.message)
  if msg.channel == "notification" then
    return { message = "changed" }          -- 返回表就替换这些字段
  end
end)

Net.on_state(function(state, detail) Log.info("websocket " .. state) end)   -- "open" | "closed" | "failure"
Net.send("channel", "receiver", "message", "context")
```

| 函数 | 说明 |
|---|---|
| `Net.on_message(fn)` | 游戏每收到一条 WebSocket 消息调用一次 `fn(msg)`。返回表可替换 `channel`、`sender`、`message`、`context` 里的字段 |
| `Net.on_state(fn)` | 连接状态变化时 `fn(state, detail)` |
| `Net.send(channel, receiver, message, context)` | 通过游戏自己的连接发一条消息 |
| `Net.is_connected()` / `Net.url()` | 连接状态、当前 WebSocket 地址 |
| `Net.redirect_status()` | 服务器重定向的结果 |

## 修改收到的消息

游戏把一条消息依次交给几个监听者（会话、首页、商店）。`fn` 对每条消息只运行一次，**每个监听者都会看到你改过的文本**。游戏会复用保存这些字符串的内存，所以 kmod 在每个监听者处理完后把原文写回去：改动不会泄漏到下一条消息。

字符串是用引擎自己的分配器创建的副本，游戏释放它时不会出问题。

## 权限

`game_network` 是声明，不是沙箱（见 [Http](http.md) 的说明）。能改游戏收到的消息的模组可以影响游戏行为，只安装你信任的模组。

## `Net.on_send(fn)` 和 `Net.on_open(fn)`

- `Net.on_send(fn)`：游戏每发一条消息就调用 `fn(msg)`，`msg = { channel, receiver, message, context }`。返回一张表可以替换其中的字段。`Net.send` 发的消息不会触发。
- `Net.on_open(fn)`：游戏打开 WebSocket 时调用 `fn({ url, token })`，返回表可以改地址或令牌。

它们依赖原生函数钩子（见[钩子](../../concepts/hooks.md)）。
