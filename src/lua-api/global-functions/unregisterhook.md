
# UnregisterHook

```lua
UnregisterHook(id)
UnregisterHook(functionPath, id)
```

撤销 [`RegisterHook`](registerhook.md) 注册的钩子。

## 参数

接受钩子 id；也接受 `(路径, id)` 的 UE4SS 写法，此时路径被忽略，只用 id。

模组被禁用或重新加载时，它的钩子会自动撤销，通常不需要手动调用。
