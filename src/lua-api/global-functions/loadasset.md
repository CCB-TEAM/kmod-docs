
# LoadAsset

```lua
local obj, err = LoadAsset(path)
```

同步加载任意资源，包括 pak 里的内容。已经加载的资源直接返回同一个对象。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 带包路径的对象路径，以 `/` 开头，如 `"/Game/UI/WBP_Foo.WBP_Foo_C"` |

路径写 `包路径.对象名`。蓝图类要在对象名后加 `_C`。没有 `.` 时，加载器会把包名最后一段补成对象名（`/Game/Data/T` 当作 `/Game/Data/T.T`）。

## 返回值

成功返回 [`UObject`](../classes/uobject.md) 包装；失败返回 `nil` 和原因字符串（路径不是以 `/` 开头、找不到资源等）。注意失败是 `nil`，和 `Find*` 系列不同。

## 说明

- 要拿到路径，最方便的是在游戏里已有对象上调用 [`GetPathName()`](../classes/uobject.md#getpathname)。
- 同步加载可能卡顿一帧到几帧，别在每帧调用，也别在循环里反复加载。
- 已在 Android 上测试：加载已载入的蓝图类和贴图返回同一对象，加载 pak 里的 DataTable 成功，路径不存在时返回 `nil` 和原因。
- 内部走 `KismetSystemLibrary::MakeSoftObjectPath` → `Conv_SoftObjPathToSoftObjRef` → `LoadAsset_Blocking`。

## 示例

```lua
local cls, err = LoadAsset("/Game/Blueprints/CrossPlatformUI/NUI_Widgets/WBP_NUI_MasterSlider.WBP_NUI_MasterSlider_C")
if not cls then
  Log.warn("load failed: " .. tostring(err))
end
```
