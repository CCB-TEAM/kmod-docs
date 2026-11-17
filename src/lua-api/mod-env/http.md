
# Http

发 HTTP(S) 请求。底层是 Java 的 `HttpURLConnection`（用系统的证书），在后台线程里执行，**不卡游戏**；回调在游戏线程里调用，可以直接操作游戏对象。

模组必须在 `mod.json` 里声明网络权限，否则调用会抛错：

```json
{ "id": "my_mod", "permissions": ["network"] }
```

```lua
Http.get("https://example.com/api?x=1", function(resp)
  if resp.error then Log.warn(resp.error) return end
  local data = Http.json(resp)            -- 把 body 当 JSON 解析
  Log.info(resp.status .. " " .. tostring(data and data.name))
end)

Http.post("https://example.com/api", { hello = "kmod" }, function(resp) ... end)   -- 表会按 JSON 发送
```

## 函数

| 函数 | 说明 |
|---|---|
| `Http.get(url [, opts], cb)` | GET |
| `Http.post(url, body [, opts], cb)` | POST。`body` 是字符串，或表（编码成 JSON，并自动加 `Content-Type: application/json`） |
| `Http.request(opts, cb)` | 通用：`opts.method`、`opts.url`、`opts.body`、`opts.headers` |
| `Http.download(url, path [, opts], cb [, progress])` | 把响应体**流式写入文件**，不占内存。`path` 必须在 `kmod/data`、`mods`、`paks` 或 `art` 里，父目录自动创建。`cb(resp)` 成功时有 `resp.saved`、`resp.size`；`progress(bytes, total)` 每秒约 6 次（`total` 未知时是 -1） |
| `Http.json(resp)` | `resp.body` 解析成 Lua 值，失败返回 `nil` |

`opts` 的字段：`headers`（表，名字 → 值）、`timeout`（毫秒，默认 15000，范围 1000–60000）、`max_bytes`（响应体上限，默认 8 MB）。

## 响应

回调收到的表：

| 字段 | 说明 |
|---|---|
| `status` | HTTP 状态码；请求没发出去（DNS、连接、超时、证书）时是 `0` |
| `body` | 响应体字符串（4xx/5xx 时是错误页内容） |
| `headers` | 响应头，名字 → 值 |
| `error` | 出错时的说明，例如 `java.net.UnknownHostException: ...`；成功时没有这个字段 |

## 限制

- 只允许 `http://` 和 `https://`；同时最多 6 个请求。
- **明文 `http://` 会被 Android 拦截**（`Cleartext HTTP traffic ... not permitted`），请使用 `https://`。
- 模组重新加载后，还没返回的请求的回调会被丢弃。
- 响应超过 `max_bytes` 时被截断，同时 `error` 说明。

## 权限的含义

`permissions` 是**声明**：它让玩家和审查者一眼看出模组要联网，也让没声明的模组无法调用 `Http`。但它**不是沙箱**：模组的主 Lua 状态里仍有完整的 `io` 和 `os`，一个恶意模组可以绕开声明。只安装你信任的模组。
