
# UObject

游戏对象的包装。`FindFirstOf` 等函数的返回值，钩子回调的 `self`，对象属性的值（指针类型）都是它。失效和找不到的规则见[对象与有效性](../../concepts/object-validity.md)。

## 读写属性、调用函数

```lua
local pc = FindFirstOf("PlayerController")
if pc:IsValid() then
  local pawn = pc.Pawn                  -- 读属性：直接用名字
  pc.bShowMouseCursor = true            -- 写属性
  pc:ClientIgnoreLookInput(false)       -- 调用游戏函数：obj:函数名(参数...)
end
```

- 读属性、写属性、调用函数都按虚幻的反射名字，和蓝图里看到的名字一致。属性名和下面的方法重名时，方法优先，用 `GetPropertyValue` / `SetPropertyValue` 显式读写。
- 数值、布尔、字符串直接转成 Lua 值；对象指针返回另一个 `UObject`；结构体和数组也会转成 Lua 值。`TMap`/`TSet` 可读，委托属性读成带 `Broadcast` 等方法的代理；各类型的读写范围见 [UE4SS 兼容](../global-functions/ue4ss-compat.md)。
- 函数调用的返回：先是返回值，再是各个输出参数，按声明顺序依次返回。

> [!NOTE]
> `FText`、`FString` 的对象属性现在可以直接赋值。对 UI 控件，仍然推荐 `widget:SetText("...")`，因为控件要刷新显示。

## 方法

### IsValid()
对象是否还活着。对无效对象也可以调用，是唯一安全的判断方式。

### GetName()
短名，不含包路径。

### GetFullName()
带类名的名字，如 `Texture2D T_Foo.T_Foo`，同样**不含包路径**。

### GetPathName()
带包路径的完整路径，如 `/Game/UI/Foo.Foo_C`、`/Game/Maps/StartingLevel.StartingLevel:PersistentLevel:BP_PlayerController_C`。顶层资源用 `.` 连接，子对象用 `:`。可以直接交给 [`LoadAsset`](../global-functions/loadasset.md)。

### GetClass()
对象的类，返回 `UObject`。

### GetOuter()
外层对象，返回 `UObject`。顶层资源的外层是它所在的包。

### GetDefaultObject()
类对象的默认对象（CDO，`Default__类名`），其他对象返回无效对象。蓝图类的默认值（比如卡牌的 `attack`）就存在它上面；改它只影响**之后**创建的实例，已经存在的实例不变。

### IsA(class)
`class` 是类名字符串或类对象。返回是否是该类（含子类）的实例。

### GetPropertyValue(name) / SetPropertyValue(name, value)
显式读写属性。`GetPropertyValue` 找不到属性返回 `nil`；`SetPropertyValue` 找不到会抛错。

### CallFunction(name, ...)
显式调用函数，找不到会抛错。

### GetProperties() / GetFunctions()
列出属性和函数，调试用。`GetProperties()` 返回数组，元素是带 `name`、`type`、`offset`、`owner` 的表；`GetFunctions()` 返回 `类名.函数名` 字符串的数组。对类对象调用时列出该类及其父类的成员。控制台里的 `props` / `funcs` 指令就是基于它们。

### GetAddress()
对象地址（整数），调试用。

## 比较

两个包装用 `==` 比较时，指向同一个游戏对象就相等。

## 类和结构体对象上的方法

`cls:IsChildOf(other)`、`cls:GetSuperStruct()`、`cls:GetCDO()`、`struct:ForEachProperty(fn)`、`struct:ForEachFunction(fn)`；任意对象都有 `obj:get()`（返回自己，兼容 UE4SS 的写法）。见 [UE4SS 兼容](../global-functions/ue4ss-compat.md)。
