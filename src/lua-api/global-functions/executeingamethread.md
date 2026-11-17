
# ExecuteInGameThread

```lua
ExecuteInGameThread(fn)
```

把 `fn` 排到下一次游戏线程 tick 执行。

在 kmod 里模组脚本本来就跑在游戏线程上，这个函数的用处是**推迟**：比如不想在当前钩子回调的栈里直接做某件事（例如重建正在触发事件的控件），就把它排到下一个 tick。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | function | 无参数回调 |
