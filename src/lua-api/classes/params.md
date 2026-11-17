
# Params

[`RegisterHook`](../global-functions/registerhook.md) 回调的第二个参数，代表被钩函数的参数。

```lua
RegisterHook("WBP_Foo_C:SetScore", function(self, params)
  Log.info("score = " .. tostring(params.NewScore))   -- 按参数名读
  params.NewScore = 99                                -- 前置回调里写会改变传给函数的值
end)
```

- 用函数声明里的**参数名**访问，不是位置。不存在的名字读出来是 `nil`，写会抛错 `no parameter '...'`。
- 类型转换规则和 [`UObject`](uobject.md) 的属性相同。
- 函数的输出参数和返回值也在 `params` 里，在后置回调里读它们；返回值的参数名通常是 `ReturnValue`。
- `params` 只在回调执行期间有效，不要保存起来以后再用。

> [!IMPORTANT]
> **未验证**
>
> 前置回调里改 `params` 影响调用这一点按实现机制写成，没有专门测过。
