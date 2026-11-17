
# NotifyOnNewObject

```lua
NotifyOnNewObject(className, fn [, fast])
```

新创建了某个类（含子类）的对象时调用 `fn`。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 类名，规则同 [`FindFirstOf`](findfirstof.md) |
| 2 | function | `fn(obj)`，`obj` 是新对象的 [`UObject`](../classes/uobject.md) 包装 |
| 3 | boolean | 可选。`true` 用快速通道，每约 16 ms 扫描一次（默认约 50 ms）。见 [`FastLoop`](fastloop.md) |

## 说明

- 实现方式是定期比较全局对象表每个槽位的（指针，序号），引擎会复用释放的槽位，所以序号也参与比较；在两次扫描之间创建又销毁的对象会漏掉。
- 对象刚创建时可能还没初始化完。需要读写属性的话，用 [`ExecuteWithDelay`](executewithdelay.md) 稍后再处理。
- 默认对象（CDO）不触发。
- 模组被禁用或重新加载时自动取消。

## 示例

```lua
NotifyOnNewObject("PlayerController", function(pc)
  ExecuteWithDelay(500, function()
    if pc:IsValid() then Log.info("new controller: " .. pc:GetPathName()) end
  end)
end)
```
