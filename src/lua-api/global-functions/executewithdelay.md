
# ExecuteWithDelay

```lua
ExecuteWithDelay(ms, fn)
```

`ms` 毫秒后在游戏线程里执行一次 `fn`。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | number | 延迟，毫秒 |
| 2 | function | 无参数回调 |

## 说明

- 精度约 50 ms（核心每秒约 20 次轮询），见[游戏线程](../../concepts/game-thread.md)。
- 回调里的错误写进日志并计入模组错误数。
- 模组被禁用或重新加载时，还没执行的任务自动取消。

## 示例

```lua
ExecuteWithDelay(2000, function()
  Log.info("two seconds later")
end)
```

想让一个函数周期性自己重复，可以在回调里再调用 `ExecuteWithDelay`；也可以用 [`LoopAsync`](loopasync.md)。
