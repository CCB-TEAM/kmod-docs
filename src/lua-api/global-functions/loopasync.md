
# LoopAsync

```lua
LoopAsync(ms, fn)
```

每隔 `ms` 毫秒在游戏线程里调用一次 `fn`，直到 `fn` 返回 `true`。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | number | 间隔，毫秒 |
| 2 | function | 无参数回调；返回 `true` 停止循环，返回其他值继续 |

## 说明

- 回调**抛错时循环会停止**，不会继续重复；错误写进日志并计入模组错误数。
- 精度约 50 ms；名字里的 "Async" 只是兼容 UE4SS，回调仍在游戏线程执行。
- 模组被禁用或重新加载时自动取消。

## 示例

```lua
local n = 0
LoopAsync(1000, function()
  n = n + 1
  Log.info("tick " .. n)
  return n >= 5          -- 五次后停止
end)
```
