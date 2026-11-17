
# 编辑器补全（typegen）

游戏里有上万个类，靠记很难写对属性名和参数。kmod 可以**从正在运行的游戏里**导出这些类型信息，生成 [Lua 语言服务器（LuaLS）](https://luals.github.io/) 的类型声明，装了 LuaLS 的编辑器（如装了 Lua 扩展的 VS Code）就能自动补全、悬停看类型、对写错的名字报警告。

## 生成

在开发版控制台里输入：

```
typegen
```

会在 `kmod/types/` 下生成：

| 文件 | 内容 |
|---|---|
| `Script_Engine.lua`、`Script_kards.lua`、…… | 每个引擎模块一个文件：类、结构体、枚举，类里有属性（`---@field`）和函数（带参数和返回值类型） |
| `Game.lua` | 游戏蓝图里的类（`WBP_*_C`、`BP_*_C` 等） |
| `kmod_api.lua` | kmod 自己的接口：`Mod`、`Log`、`Settings`、`Lang`、`Console`、`kmod`，以及 `FindFirstOf`、`RegisterHook` 等全局函数 |
| `.luarc.json` | 给 LuaLS 的配置，把 `types/` 当作库 |

在 1.61 版上实测：约 0.3 秒，198 个文件共 5.8 MB，6941 个类、5425 个结构体、1852 个枚举、29548 个函数。

只要一部分的话，按包名过滤（子串匹配，不分大小写），比如只要引擎和游戏自己的：

```
typegen Engine kards
```

被过滤掉的包里的类型，在别的文件里被引用时会显示"未定义的类型"警告，不影响使用。

## 用在编辑器里

1. 把 `kmod/types/` 整个文件夹复制到电脑上你的模组项目里（在手机上可以用 USB 复制，或 `adb pull`）。
2. 把 `types/.luarc.json` 放在项目根目录，里面已经把 `./types` 设成库。
3. 用 VS Code 打开项目，装 [Lua 扩展（sumneko）](https://marketplace.visualstudio.com/items?itemName=sumneko.lua)。

```lua
local pc = FindFirstOf("PlayerController")   -- 类型是 PlayerController，敲 pc. 就有补全
pc.bShowMouseCursor = true                    -- 属性类型 boolean
pc:ClientRestart(somePawn)                    -- 悬停显示参数 NewPawn: Pawn
```

`FindFirstOf`、`FindAllOf`、`FindObject`、`NotifyOnNewObject` 的类名参数用了泛型：传字符串字面量时，返回值的类型就是这个类。

## 类型映射

| 游戏类型 | Lua 声明 |
|---|---|
| `bool` | `boolean` |
| 各种整数、浮点数 | `number` |
| `String`、`Name`、`Text` | `string` |
| `Object<类>` | 该类 |
| `Class<…>`、软引用、接口 | `KObject` |
| `Struct<名>`、`Enum<名>` | 该结构体 / 该枚举（枚举声明成 `integer` 的别名） |
| `Array<T>`、`Set<T>` | `T[]` |
| `Map<K,V>` | `table<K, V>` |
| 委托、其他 | `any` |
| 函数的返回值和输出参数 | 依次作为返回值 |

## 注意

- **只包含当前已加载的类**。蓝图类（尤其是界面）在打开对应界面之前没有加载，导不出来；想包含它们，先在游戏里打开相关界面再运行 `typegen`。
- **游戏更新后重新运行**，声明会和新版本对上。
- 同名类（不同包里短名相同）只保留第一个。
- 声明文件是生成的，不要手改；它们体积大，也包含游戏的类结构，**不要提交到公开仓库**。
- **验证情况**：用 LuaLS 3.19.2 的命令行检查模式加载了在手机上生成的全部 198 个文件（5.8 MB，约 30 秒），生成的声明本身没有任何错误或警告。写错属性名（`pc.bShowMouseCursorTYPO = true`）、写错函数名（`pc:ClientIgnoreLookInputTYPO()`）、访问不存在的字段（`pc.AcknowledgedPawn.NoSuchThing`）、写错 `Log.infoo` 都会被报出来。没有在 VS Code 的界面里实际看过补全弹窗，也没测过悬停显示。
- LuaLS 默认不检查运算符两边的类型：比如对 `boolean` 属性做加法不会报错。
