
# FindAllOf

```lua
local list = FindAllOf(className)
```

找某个类（含子类）的所有存活实例（不含 CDO）。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 类名，规则同 [`FindFirstOf`](findfirstof.md) |

## 返回值

[`UObject`](../classes/uobject.md) 的数组（从 1 开始）。一个都没有时返回 **`nil`**，不是空表。

## 示例

```lua
for i, w in ipairs(FindAllOf("WBP_NUI_MasterCheckbox_C") or {}) do
  Log.info(i .. ": " .. w:GetPathName())
end
```

`or {}` 是为了处理返回 `nil` 的情况。
