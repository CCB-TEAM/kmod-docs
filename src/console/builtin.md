
# 内置指令

| 指令 | 作用 |
|---|---|
| `help [指令]` | 列出所有指令；带参数时显示该指令的说明和用法 |
| `version` | 加载器版本、构建类型、接口级别、游戏版本 |
| `safe [off]` | 查看崩溃保护状态；`safe off` 离开安全模式，见[崩溃保护](../guide/safe-mode.md) |
| `unquarantine <mod\|pak> <名字>` | 让崩溃过的模组或 pak 重新加载 |
| `paks [off\|on <文件>]` | 列出 `kmod/paks` 里的 pak 和状态；`off` / `on` 开关某个 pak（下次启动生效），见 [Pak 模组](../guide/pak-mods.md) |
| `layout [redetect]` | 引擎结构布局的验证结果；`redetect` 忽略缓存重新检测，见[版本支持](../concepts/version-support.md) |
| `selftest` | 运行一组快速自检：找对象、调用函数、JSON、pak、worker |
| `mods` | 列出已安装的模组、版本和状态 |
| `enable <模组id>` / `disable <模组id>` | 启用或禁用模组并重新加载 |
| `reload` | 重新加载全部模组 |
| `lang [auto\|en\|zh-CN\|...]` | 查看或设置界面语言 |
| `settings <模组id> [键 [值]]` | 列出、读取或修改模组设置 |
| `log [条数]` | 显示 `kmod.log` 末尾若干行（默认 20，最多 200） |
| `find <类名> [上限]` | 列出某个类的存活对象路径（默认 20 个） |
| `search <关键字...> [class\|object\|function\|all] [条数]` | 按名字模糊搜索类、对象、函数 |
| `props <类名>` | 列出类的属性。类名不带 `U` / `A` 前缀 |
| `funcs <类名> [过滤词]` | 列出类的函数及其参数、返回值 |
| `hook <函数路径> [次数]` | 临时钩一个函数，把每次调用的参数打到控制台 |
| `unhook [函数路径\|all]` / `hooks` | 取消或列出控制台钩子 |
| `typegen [包名过滤...]` | 生成 LuaLS 类型声明到 `kmod/types/`，见[编辑器补全](../guides/editor-setup.md) |

## settings

- `settings mymod`：列出设置项和当前值。
- `settings mymod scale`：读一项。
- `settings mymod scale 1.5`：写一项。`number` 会按 `min` / `max` 截断，`choice` 只接受声明过的选项，`bool` 接受 `true/false/1/0/on/off`，`string` 会按 `maxlen` 截断。

## search

每个关键字都必须出现在**完整路径**里，不分大小写，空格分隔多个：

```
> search player controller class
classes (12)
  /Script/Engine.PlayerController
  ...
> search PlayerController clientrestart function
functions (2)
  /Script/Engine.PlayerController:ClientRestart
  /Script/Engine.PlayerController:ClientRetryClientRestart
```

- 第二个起可以加范围 `class` / `object` / `function`（缩写 `c` / `o` / `f`），默认 `all` 三类都搜；末尾的数字是每类最多显示几条（默认 20）。
- 结果按路径长度排序，越短越靠前；标题里写总数。
- 函数的路径可以直接交给 `hook` 和 `RegisterHook`。

## funcs

```
> funcs PlayerController clientrestart
1 funcs
  PlayerController.ClientRestart(NewPawn: Object<Pawn>)
```

类型写法：`Object<类>`、`Class<类>`、`Struct<名>`、`Enum<名>`、`Array<元素>`、`Map<键,值>`，基本类型是 `bool` `int` `float` `String` `Name` `Text` 等；输出参数前有 `out`，返回值写在 `->` 后。可选的过滤词只显示函数名包含它的。

## hook

```
> hook WBP_NUI_MasterCheckbox_C:BndEvt__WBP_NUI_Checkbox_NUI_CheckBox_K2Node_ComponentBoundEvent_0_OnCheckBoxComponentStateChanged__DelegateSignature 3
hooked WBP_NUI_MasterCheckbox_C:BndEvt__...StateChanged__DelegateSignature (bIsChecked: bool) for 3 calls
[hook 1] WBP_NUI_MasterCheckbox_C:BndEvt__...  self=/Engine/Transient.GameEngine:BP_KardsGameInstance_C:WBP_NUI_MasterCheckbox_C  (bIsChecked=true)
[hook 2] ...  (bIsChecked=false)
[hook 3] ...  (bIsChecked=true)
[hook] ...: reached 3 calls, removed
```

（上面的输出取自真机：钩住游戏里勾选框的状态变化事件，点了三下；路径里的 `...` 是为了排版省略的。）

- 每次调用在函数执行**前**打印一行：序号、路径、`self` 和各个输入参数；函数有输出参数或返回值时，执行**后**再打印一行 `-> 名字=值`。
- 次数默认 20，到次数自动取消；写 `0` 表示不限（注意刷屏）。`unhook` 取消。
- 函数必须已经存在（类已加载），找不到会提示，可以用 `search` 找路径。
- 字符串超过 60 字符会截断，表只显示前 4 项，对象显示 `GetPathName()`。
- 这些钩子属于控制台，不属于任何模组，模组重新加载时不会被清掉。

## find

```
> find PlayerController 2
1 object(s)
/Game/Maps/StartingLevel.StartingLevel:PersistentLevel:BP_PlayerController_C
> props PlayerController
144 props
AcknowledgedPawn : ObjectProperty  (PlayerController)
...
```
