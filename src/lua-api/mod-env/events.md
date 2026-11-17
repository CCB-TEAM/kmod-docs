
# Events

所有模组共用的事件总线，用来让模组之间互相通知。模组重新加载时，所有处理函数都会清掉。

```lua
local h = Events.on("card_art.changed", function(card, variant) ... end)
Events.emit("card_art.changed", "t_pnz_35t", "Touhouards")
Events.off(h)
```

| 函数 | 说明 |
|---|---|
| `Events.on(name, fn)` | 注册处理函数，返回句柄 |
| `Events.off(handle)` | 取消注册 |
| `Events.emit(name, ...)` | 依次调用所有处理函数，参数原样传入，返回调用了几个 |

## 说明

- 处理函数在调用 `emit` 的那个线程（游戏线程）里同步执行。
- 处理函数抛错会写日志并计入**注册它的那个模组**的错误数（累计 10 次自动停用），不影响其他处理函数。
- 事件名是随便的字符串，建议加上模组 id 前缀避免撞名。
