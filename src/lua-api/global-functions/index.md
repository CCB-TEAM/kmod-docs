
# 全局函数

| 分组 | 函数 |
|---|---|
| 查找对象 | [`FindFirstOf`](findfirstof.md)、[`FindAllOf`](findallof.md)、[`FindObject`](findobject.md)、[`StaticFindObject`](staticfindobject.md)、[`CreateInvalidObject`](createinvalidobject.md) |
| 加载资源 | [`LoadAsset`](loadasset.md) |
| 钩子 | [`RegisterHook`](registerhook.md)、[`UnregisterHook`](unregisterhook.md) |
| 定时与排队 | [`ExecuteWithDelay`](executewithdelay.md)、[`ExecuteInGameThread`](executeingamethread.md)、[`LoopAsync`](loopasync.md)、[`NotifyOnNewObject`](notifyonnewobject.md) |
| 快速通道 | [`FastLoop`](fastloop.md)，以及 `NotifyOnNewObject` 的第三个参数 |
| 多线程 | [`Worker`](worker.md)：独立线程、独立 Lua 状态、消息通信；[`ExecuteAsync`](executeasync.md) |
| UE4SS 兼容 | 延迟动作句柄、生命周期钩子、`ForEachUObject`、`StaticConstructObject` 等，见 [UE4SS 兼容](ue4ss-compat.md) |
| 输出 | `print(...)`：等价于 `Log.info`，见 [Log](../mod-env/log.md) |

在模组里，`RegisterHook`、`ExecuteWithDelay`、`ExecuteInGameThread`、`LoopAsync`、`NotifyOnNewObject`、`FastLoop`、`ExecuteAsync`、`Worker` 带有模组标记：模组被禁用或重新加载时，它注册的东西自动撤销。
