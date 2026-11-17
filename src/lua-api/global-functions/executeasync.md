
# ExecuteAsync

```lua
ExecuteAsync(fn)
```

在下一次 tick（约 50 ms 内）于**游戏线程**调用 `fn`。与 [`ExecuteInGameThread`](executeingamethread.md) 相同，保留这个名字是为了兼容 UE4SS 的脚本。

> [!NOTE]
UE4SS 的 `ExecuteAsync` 在模组自己的线程里排队，并不是并行执行。kmod 里的"真并行"请用 [`Worker`](worker.md)。
