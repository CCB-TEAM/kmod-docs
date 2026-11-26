# 开发版控制台（Windows）

开发版（`kmod-loader-windows-<版本>-dev.zip`）在游戏启动时多开一个**控制台窗口**，类似 UE4SS 的控制台：

- 实时显示 kmod 的全部日志：错误红色，警告黄色，调试行灰色。
- 底部可以输入[控制台指令](../console/index.md)或 Lua 表达式，回车执行。指令在游戏线程上执行，结果显示在窗口里。
- 窗口没有关闭按钮，也忽略 Ctrl+C，免得误操作结束游戏。要关它，退出游戏。

## 常用指令

输入 `help` 看完整列表。写模组时最常用的：

| 指令 | 作用 |
|---|---|
| `mods` | 列出模组和状态 |
| `enable <id>` / `disable <id>` / `reload` | 启用、停用、重新加载模组 |
| `find <类> [数量]` | 找这个类的实例 |
| `props <类>` / `funcs <类>` | 列出类的属性或函数 |
| `search <词> [类别]` | 在所有对象里按名字搜 |
| `hook <函数路径> [次数]` | 打印这个函数每次被调用的参数，用来弄清楚界面在调什么 |
| `unhook` / `hooks` | 取消或查看这些钩子 |
| `dump objects` / `dump actors` | 把所有对象或所有 Actor 写成文本文件（在 `logs\` 里），和 UE4SS 的对象转储类似 |
| `typegen` | 生成类型声明，给编辑器补全用 |
| `log [行数]` | 显示日志末尾 |
| `layout` | 引擎布局检查的结果 |
| `safe` / `unquarantine` | 安全模式和被隔离的模组 |

不是指令的输入当作 Lua 执行，可以直接写表达式：

```
> FindFirstOf("GameInstance"):GetFullName()
= BP_KardsGameInstance_C Transient.GameEngine.BP_KardsGameInstance_C
```

## 开发版和正式版的区别

| | 正式版 | 开发版 |
|---|---|---|
| 控制台窗口 | 无 | 有 |
| 日志级别 | 信息及以上 | 含调试行 |
| 设置页版本行 | `kmod 0.4.0 release` | `kmod 0.4.0 dev` |
| 脚本热加载 | 无 | 可用 `kmod\dev\` 里的 `modloader.lua` 等覆盖内置脚本 |

开发版的核心带符号信息，崩溃日志里的地址能对回函数。

## 查界面问题的办法

不知道游戏某个界面用的是哪个控件或事件时：

1. 开发版里，`hook` 一个猜测的事件（比如按钮的 `OnClicked` 委托），去界面上操作，看输出。
2. `find <类名>` 看这个控件在不在，`props <类名>` 看它有哪些成员。
3. 同一个界面在 Windows 和 Android 上可能是不同的控件（例如卡牌详情页，Android 是 `W_CollectionCardDetail_Mobile_C`，Windows 是 `W_CollectionCardDetail_PC_C`），写模组时两个都要考虑。
