
# FindFirstOf

```lua
local obj = FindFirstOf(className)
```

找某个类的第一个存活实例（不含默认对象 CDO）。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 类名，不带 `U` / `A` 前缀，如 `"PlayerController"`；蓝图类带 `_C`，如 `"WBP_NUI_MasterCheckbox_C"` |

## 返回值

[`UObject`](../classes/uobject.md)。找不到时返回一个**无效对象**，不是 `nil`，用 `:IsValid()` 判断。

## 说明

- 每次调用都会线性扫描全局对象表（约八万个对象），不要每帧调用，找到后自己缓存，并在使用前检查 `IsValid()`。
- 多个实例时返回哪一个不确定。要全部实例用 [`FindAllOf`](findallof.md)。

## 示例

```lua
local pc = FindFirstOf("PlayerController")
if pc:IsValid() then
  Log.info("controller: " .. pc:GetPathName())
end
```
