
# 游戏线程

kmod 在 `UObject::ProcessEvent` 上装了一个内联钩子。游戏线程每次调用 `ProcessEvent` 时，核心都顺带运行 Lua：

- **Lua 只在游戏线程执行**：模组脚本、钩子回调、定时器回调、控制台指令都在这个线程里，直接读写游戏对象是安全的，不需要加锁。
- **心跳**：游戏静止（比如停在等待点击的界面）时，引擎几乎不调用任何事件，只靠"每调用若干次事件就处理一次"会让定时器停摆。核心因此用引擎自己的定时器（`K2_SetTimer`，约 16 ms）定期调用 `PlayerController` 的一个无害函数，核心钩住它来驱动 tick。
- **tick 约 20 Hz**：定时器和 `NotifyOnNewObject` 的检查每秒大约执行 20 次，所以 `ExecuteWithDelay` / `LoopAsync` 的精度在 50 ms 量级，不适合做动画。
- **回调要快**：回调同步执行，卡住就等于卡住游戏。需要做重活（比如同步 [`LoadAsset`](../lua-api/global-functions/loadasset.md)）时，注意它可能卡一帧到几帧。
- **快速通道**：[`FastLoop`](../lua-api/global-functions/fastloop.md)，以及 `NotifyOnNewObject` 的第三个参数，每隔几毫秒检查一次，用于必须赶在下一帧之前完成的小检查。回调要非常轻。
- **`LoopAsync`、`ExecuteInGameThread`、`ExecuteAsync` 不是并行**：名字像 UE4SS，但在 kmod 里都跑在游戏线程上，只是被排到后面的 tick。
- **真正的并行用 `Worker`**：[`Worker`](../lua-api/global-functions/worker.md) 在独立线程、独立 Lua 状态里运行脚本，不会卡游戏。游戏对象只能在游戏线程里碰，所以 worker 只处理数据（文件、JSON、计算），结果通过消息回到游戏线程，在 `onMessage` 回调里再应用到游戏对象上。
