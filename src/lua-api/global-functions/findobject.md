
# FindObject

```lua
local obj = FindObject(className, name)
```

找类型为 `className`（含子类）、短名等于 `name` 的第一个对象。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 类名 |
| 2 | string | 对象的短名（`obj:GetName()` 的结果） |

## 返回值

[`UObject`](../classes/uobject.md)，找不到时是无效对象。

## 示例

```lua
-- 找蓝图类对象
local cls = FindObject("WidgetBlueprintGeneratedClass", "WBP_NUI_MasterSlider_C")
```
