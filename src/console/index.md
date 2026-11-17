
# 控制台指令

kmod 有一套指令系统：[内置指令](builtin.md)用来查看和管理模组，模组可以用 [`Console.register`](register.md) 注册自己的指令。

> [!NOTE]
> 指令系统在开发版和正式版里都存在，但**输入界面只有开发版有**（悬浮控制台，见[调试与日志](../guides/debugging.md)）。正式版里模组仍能注册指令，只是玩家没有地方输入；模组可以用 `Console.exec` 在自己的脚本里触发指令。

## 怎么输入

在开发版控制台里输入一行：

- 第一个词是已注册的指令名，就按指令执行：`mods`、`greet "Mr Smith"`。
- 行首加 `/` 强制按指令执行：`/mods`。指令不存在时会提示 `unknown command`，不会当 Lua 去跑。
- 其他情况照旧当 Lua 表达式或语句执行。
- 指令名后面紧跟 Lua 语法（`=`、`.`、`(`、`:`、`[`）时，当 Lua 处理，所以 `mods = 1` 不会误触发 `mods` 指令。

参数按空格分隔，可以用双引号或单引号把带空格的内容括起来，引号里用反斜杠转义：`greet "Mr \"X\" Smith"` 得到一个参数。

## 查游戏数据

写模组时常要先弄清游戏里有什么。控制台里能做的：

- `search <关键字>`：按名字模糊搜类、对象、函数。
- `find <类名>`：列出存活对象的完整路径。
- `props <类名>` / `funcs <类名>`：列出类的属性、函数（`funcs` 带参数和返回值类型）。
- `hook <函数路径>`：监听函数调用，把每次的参数打出来。
- 直接写 Lua：`FindFirstOf("PlayerController").Pawn:GetPathName()`。
- 开发版的 `kmod.print_tree(widget, 深度)`：打印控件树。
- [`LoadAsset`](../lua-api/global-functions/loadasset.md)：加载 pak 里的资源再去读它。

与 UE4SS 相比，kmod **没有**一键转储对象列表、USMAP 或头文件的功能；想要全量数据，目前还得用 Dumper-7 离线转储。
