
# StaticFindObject

```lua
local obj = StaticFindObject(path)
```

按路径找**已经加载**的对象。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 对象路径，如 `"/Script/Engine.Default__Object"`、`"/Game/UI/WBP_Foo.WBP_Foo_C"`，也接受不带包路径的 `"WBP_Foo_C"` |

多于一个参数时取**最后一个**字符串作路径，所以 UE4SS 风格的 `StaticFindObject(nil, nil, path)` 也能用。

## 返回值

[`UObject`](../classes/uobject.md)，找不到时是无效对象。

## 说明

> [!WARNING]
> 匹配时只比较路径**最后一段起**的名字（对象名及其外层），不比较完整包路径。两个不同包里有同名对象时，可能返回错误的那个。需要精确加载某个包里的资源，用 [`LoadAsset`](loadasset.md)。

- 只在已加载的对象里找，不会触发加载。
- 每次调用线性扫描全局对象表，不要每帧调用。

## 示例

```lua
local lib = StaticFindObject("/Script/UMG.Default__WidgetBlueprintLibrary")
```
