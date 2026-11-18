# 游戏内菜单（Windows）

Windows 版有一个画在游戏画面上的菜单（用 [Dear ImGui](https://github.com/ocornut/imgui)），不用退出游戏就能管理模组、看日志、执行指令。

按 **Insert** 打开或关闭。游戏启动后左上角会显示十几秒的提示，之后不占用画面。

菜单打开时，鼠标在菜单上的点击和键盘输入只给菜单，不会传到游戏里；鼠标不在菜单上时，游戏照常收到。

## 页面

**Mods**：所有模组的列表。左边的勾选框启用或停用（等同控制台的 `enable` / `disable`，会重新加载模组），"Reload mods" 重新加载全部。鼠标停在模组名上显示它的 id。状态列显示加载情况或错误。列表约每秒刷新一次。

**Console**：kmod 的日志，实时滚动：错误红色，警告黄色，调试行默认隐藏（勾 "debug lines" 显示）。底部的输入框可以输入[控制台指令](../console/index.md)或 Lua 表达式，回车执行，结果出现在日志里。`help` 列出所有指令。指令在游戏线程上执行，和开发版控制台窗口是同一套。

**About**：加载器版本、游戏用的渲染器（Direct3D 11 或 12）、帧率。

## 它是怎么画上去的

kmod 找到系统 `dxgi.dll` 里 `IDXGISwapChain::Present` 的地址（建一个临时窗口和交换链读取它），内联钩住它。游戏每次呈现一帧时，kmod 先把菜单画到后备缓冲上，再交给原来的 `Present`。

- 游戏用 Direct3D 11：用 ImGui 的 DX11 后端，直接画到后备缓冲。
- 游戏用 Direct3D 12：从交换链取出它的命令队列，用自己的命令列表在队列上提交一次绘制，带围栏同步，不干扰游戏自己的帧。

两种路径都是启动后在第一次 `Present` 时才判断的，日志里会写：

```
I/overlay: the game renders with Direct3D 12 (window 0x..., 1920x1080, format 28, 3 buffers)
I/overlay: ready: running (Direct3D 12); press Insert to open the menu
```

菜单关闭且提示消失后，kmod 不再碰任何一帧。

## 关掉它

在 `kmod\` 里新建一个空文件 `no_overlay`，下次启动不再钩 `Present`。和其他也钩 `Present` 的程序（Steam / Discord 叠加层、RTSS 等）可以共存。

## 出问题时

日志里 `[overlay]` 开头的行说明卡在哪一步：

| 日志 | 含义 |
|---|---|
| `could not find IDXGISwapChain::Present` | 无法创建临时交换链（显卡驱动问题） |
| `Present hook failed` | 内联钩子没装上 |
| `initialisation failed (attempt N): ...` | 游戏的交换链读不到设备或命令队列；会重试一段时间后放弃，游戏不受影响 |

菜单只在渲染线程上画，不会直接调用 Lua；点击产生的操作都放进队列，由游戏线程执行。
