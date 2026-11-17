
# RegisterHook

```lua
local id = RegisterHook(functionPath, pre, post)
```

在游戏函数上挂前置和后置回调。概念见[钩子](../../concepts/hooks.md)。

## 参数

| # | 类型 | 说明 |
|---|---|---|
| 1 | string | 函数路径：`包路径.类名:函数名`，如 `"/Script/Engine.PlayerController:ClientRestart"`。蓝图类的函数用类名加 `_C`，如 `"WBP_Foo_C:OnClicked"` |
| 2 | function | 函数执行**前**调用 |
| 3 | function | （可选）函数执行**后**调用 |

函数路径解析时只比较路径最后一段起的名字（类名和函数名）。

蓝图函数的所有调用（包括蓝图直接调蓝图）都会触发，见[钩子](../../concepts/hooks.md)。蓝图函数的参数可以在前置回调里修改，字符串参数会用引擎分配的副本替换。

## 回调参数

`pre(self, params)` / `post(self, params)`：

| # | 类型 | 说明 |
|---|---|---|
| 1 | [`UObject`](../classes/uobject.md) | 被调用的对象（`this`），直接是对象；写 UE4SS 习惯的 `self:get()` 也行，返回对象本身 |
| 2 | [`Params`](../classes/params.md) | 函数参数，按名字读写 |

**回调返回一个值，就会替换函数的返回值**（和 UE4SS 一样）：前置回调里返回的值会被函数自己的返回值覆盖（对原生函数没有效果），所以要改结果请在**后置回调**里返回。返回 `nil`（什么都不返回）保持原值。蓝图函数的字节码已经执行完，后置回调里返回的值替换的是调用方收到的结果。不能通过返回值取消调用。

## 返回值

返回钩子 id（同一个 id 返回两次，兼容 UE4SS 的"两个 id"写法）。

## 错误

- 路径找不到对应的 `UFunction` 时**抛错**：`RegisterHook: function not found: ...`。函数所在的类必须已经加载。
- 回调里的错误写进日志并计入模组的错误数，不影响游戏。

## 示例

```lua
RegisterHook("/Script/Engine.PlayerController:ClientRestart",
  function(self, params)
    Log.info("before: " .. self:GetName())
  end,
  function(self, params)
    Log.info("after")
  end)
```

> [!IMPORTANT]
> **未验证**
>
> `ClientRestart` 这个具体例子没有在手机上运行过。钩子机制本身（含蓝图函数的后置回调）在 Mods 页的实现里已经用到。
