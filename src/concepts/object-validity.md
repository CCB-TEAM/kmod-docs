
# 对象与有效性

`FindFirstOf` 等函数返回的是 **UObject 包装**（userdata），不是游戏对象本身。包装里记着对象的地址、它在全局对象表里的槽位，以及这个槽位当时的序号（引擎每次复用槽位都会改序号）。

## 失效

对象会在切场景、被垃圾回收时消失。每次访问包装，kmod 都会去全局对象表里重新确认：槽位里还是这个地址、序号没变、没有被标成垃圾。所以即使引擎把这个槽位给了一个恰好同地址的新对象，旧引用也会判定失效。（序号是引擎在第一次给对象建弱引用时才分配的，在那之前句柄只靠地址和槽位判断。）所以：

- 旧引用不会指向别的对象，也不会崩溃；
- 对象没了，`obj:IsValid()` 返回 `false`；
- 对失效对象读写属性、调用函数会**抛 Lua 错误** `UObject is invalid`。

```lua
local pc = FindFirstOf("PlayerController")
if pc:IsValid() then
  print(pc:GetName())
end
```

长期保存引用时，每次用之前先检查 `IsValid()`，或者每次重新查找。

## 找不到时返回什么

| 函数 | 找不到时 |
|---|---|
| `FindFirstOf`、`FindObject`、`StaticFindObject`、`CreateInvalidObject` | 返回一个**无效对象**（不是 `nil`），用 `IsValid()` 判断 |
| `FindAllOf` | 返回 `nil` |
| `LoadAsset` | 返回 `nil` 和原因字符串 |

> [!WARNING]
> `if not FindFirstOf("X") then` 永远不会成立，因为返回的是对象。一律用 `:IsValid()`。

## 包路径

`GetName()` 和 `GetFullName()` 返回的名字**不含包路径**（只有最后一段）。要带包路径的完整路径，用 [`GetPathName()`](../lua-api/classes/uobject.md#getpathname)，它可以直接交给 `LoadAsset`。
