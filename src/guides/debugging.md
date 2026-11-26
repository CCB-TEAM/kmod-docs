
# 调试与日志

## 日志文件

```
kmod/logs/kmod.log       # 本次运行
kmod/logs/kmod.1.log     # 上一次运行
...
kmod/logs/kmod.4.log     # 最多保留最近 5 次运行
```

行格式：

```
2026-11-16 13:25:33.180 W/loader: dep_new_mod: requires kmod>=9.0.0 (have 0.4.0)
日期   时间(毫秒)         级别/标签: 内容
```

- 级别：`D` 调试、`I` 信息、`W` 警告、`E` 错误。**开发版**记录 DEBUG 及以上，**正式版**记录 INFO 及以上。
- 标签：`core`（核心）、`loader`（模组加载）、`kmod`（日志系统本身）、`lua`（控制台等）、其余是模组 id（`Log.*` 和 `print` 的输出）。
- 每次运行的第一行是版本头：`=== kmod loader 0.4.0 (release) started ===`，后面有设备信息。
- Lua 错误会带调用栈。
- 同样的内容也会输出到 logcat，tag 为 `KModCore`、`KModLoader`：

```bash
adb logcat -s KModCore KModLoader
```

## 崩溃日志

核心装有原生崩溃处理，遇到 SIGSEGV / SIGBUS / SIGABRT / SIGFPE / SIGILL 时，先写一条 `FATAL` 行到 `kmod.log`，包含信号、出错地址、调用者地址和回溯，然后再交给系统（Android 仍会生成 tombstone）。

崩溃后重新启动，看**上一次**的日志 `kmod.1.log`，最后几行就是崩溃信息。

开发版可以主动制造崩溃来验证：`kmod.debug_crash("segv")` 或 `kmod.debug_crash("abort")`（正式版没有这个函数）。

## 开发版控制台

开发版有两种方式运行 Lua 代码：

### 悬浮窗

游戏画面上有一个可拖动的绿色 **kmod** 按钮，点开是控制台面板，能看到所有日志输出。点输入栏会弹出输入框，输入 Lua 表达式或语句并执行，表达式的结果会打印出来；输入已注册的[控制台指令](../console/index.md)（如 `help`、`mods`）则执行指令；**Last** 按钮填回上一条命令。

> [!NOTE]
> 游戏主窗口拿不到输入法焦点，所以输入框是单独弹出的对话框。

### 文件控制台

把 Lua 脚本写进 `kmod/dev/console.lua`，**文件一变化就会执行**（启动时也会执行一次现有的文件）。输出写到 `kmod/dev/console.out`。适合用 `adb push` 反复迭代：

```bash
adb push console.lua /sdcard/Android/media/com.android1939.kardsapk/kmod/dev/console.lua
adb shell cat /sdcard/Android/media/com.android1939.kardsapk/kmod/dev/console.out
```

`console.lua` 里 `print` 的内容会进入 `console.out`。它在启动时也会跑，别忘了测完删掉。

## 热加载（开发版）

- `kmod/dev/libkmodcore.so`：存在时，开发版会把它拷到应用目录并用它代替 APK 里自带的核心。改完 C++ 之后只需要重新编译核心并 `adb push` 这个文件，不用重新打包 APK。
- `kmod/dev/modloader.lua`、`kmod/dev/modmanager.lua`：覆盖内置的加载器脚本和 Mods 页，改 Lua 不用重新编译。

正式版**完全忽略** `kmod/dev/` 下的所有文件。

## 常见问题

| 现象 | 看哪里 |
|---|---|
| 模组没加载 | `kmod.log` 里搜模组 id；Mods 页的状态文字 |
| `requires kmod>=...` / `requires kards>=...` | 加载器或游戏版本不够，见[依赖与版本条件](../mod-format/dependencies.md) |
| `needs loader API N` | `mod.json` 的 `api` 高于当前加载器的 `kmod.api` |
| 修改模组后没生效 | 进 Mods 页会重新加载；也可以重启游戏 |
| 访问对象报 `UObject is invalid` | 对象已被销毁，用 `obj:IsValid()` 检查，或每次重新 `FindFirstOf`，见[对象与有效性](../concepts/object-validity.md) |
| 游戏闪退 | 重启后看 `kmod.1.log` 末尾的 `FATAL` 行 |
