
# FastLoop

```lua
FastLoop(ms, fn)
```

与 [`LoopAsync`](loopasync.md) 一样重复调用 `fn`，直到它返回 `true`；区别是它走**快速通道**：在游戏线程上每隔几毫秒检查一次，而不是每 50 ms 一次。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | number | 间隔，毫秒，最小 2 |
| 2 | function | 无参数回调；返回 `true` 停止 |

## 说明

- 用于"必须赶在下一帧画出来之前完成"的小检查，比如把刚创建的界面图片换成自己的贴图，避免闪一下原图。
- 回调要**很轻**：快速通道在引擎调用里被驱动，慢回调会直接拖慢帧率。
- 有任何 FastLoop 或快速监听存在时，核心才会开启快速通道。

# NotifyOnNewObject 的快速模式

```lua
NotifyOnNewObject("W_Card2D_C", fn, true)    -- 第三个参数 true：每约 16 ms 扫描一次新对象
```

不带第三个参数时约每 50 ms 扫描一次。详见 [`NotifyOnNewObject`](notifyonnewobject.md)。
