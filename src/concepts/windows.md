# Windows 版是怎么工作的

Windows 版和 Android 版共用同一套 Lua 宿主、反射层、模组加载脚本和 `kmod.h`。不同的只有平台相关的几层：怎么被游戏加载、怎么找到引擎地址、怎么装钩子、以及网络、日志、崩溃处理。

```
kards-Win64-Shipping.exe
  └─ 加载 dwmapi.dll（游戏目录里的代理，优先于系统的）
        │  转发全部导出到 C:\Windows\System32\dwmapi.dll
        └─ 线程里加载 kmod\kmod_core.dll，调用 kmod_start()
              ├─ 扫描 PE 找 GObjects / GNames / ProcessEvent
              ├─ 内联钩 UObject::ProcessEvent → 取得游戏线程
              ├─ 钩 Blueprint 解释器（脚本函数）
              └─ Lua 宿主（和 Android 相同）
```

## 注入：dwmapi.dll 代理

游戏程序引用了 `dwmapi.dll`，而 Windows 先在程序所在目录找 DLL，所以放在那里的同名文件会被加载。代理的 99 个导出（包括只有序号的）都用转发导出指向系统库，所以游戏行为不变。代理的 `DllMain` 里只开一个线程，不加载、不加锁；线程加载 `kmod\kmod_core.dll` 并调用它导出的 `kmod_start()`。加载失败时在 `kmod\proxy.log` 写一行原因。

代理使用静态 CRT，不依赖任何运行库。

## 找引擎地址：扫描 PE

Windows 版不带写死的偏移，全部在运行时从游戏的 PE 映像里找：

| 目标 | 做法 |
|---|---|
| `GObjects`（`GUObjectArray`） | 扫描可写数据节，找满足对象数组结构的位置（块数、元素数互相一致，第一个对象的虚表指向引擎代码） |
| `GNames` | 找"指向第一个名字块、块开头是 `None`"的指针，再用名字解码确认 |
| `ProcessEvent` | 在任意对象的虚表里找这样的函数：读取 `UFunction` 的 `FunctionFlags` 和 `ParmsSize`；有多个候选时取和已知槽位（Windows 为 76）最近的 |
| Blueprint 解释器、`GNatives` | 从 `ProcessInternal`（所有脚本函数共用的执行入口，由投票得出）出发，用 Zydis 反汇编找到按操作码索引 `GNatives` 的循环 |

日志里会写找到了什么，例如：

```
I/resolver: GObjects: found by scanning at base+0x91f91d0
I/resolver: GNames: block table at base+0x91156d0
I/resolver: ProcessEvent candidates: ... 76:0x159ca40(3) ...
I/core: script hook: interpreter: ... -> plsf base+0x159cf30, GNatives base+0x91f7c60
```

找不到时 kmod 保持不活动，游戏照常运行（和 Android 版一样）。

## 钩子：x64 内联钩子

`core/src/x64.cpp`：用 Zydis 解码被覆盖的开头指令，把它们重定位到蹦床里（RIP 相对寻址、`call`/`jmp`/`jcc rel32` 都能处理），写入 14 字节的绝对跳转；写入时挂起其他线程。开头里有 `loop`、`jrcxz` 或跳进被覆盖区域的函数不会被钩，并在日志里说明原因。蹦床分配在目标 ±2GB 内。

## 布局检查

Windows 版没有 Android 那样的在进程内转储器。反射层的结构偏移（`UObject`、`UStruct`、`UFunction`、`FProperty` 等）用的是 UE 5.6 在 Windows 上的实际值，启动时对运行中的游戏**抽样检查**：对象、类继承链、函数、参数是否自洽。结果写进日志：

```
I/layout: engine layout verified: objects 6352/6352, class chains 455/455, functions 600/600, parameters 1219/1219 ...
```

不自洽时不加载任何模组（和 Android 版一样），并写出哪一类对不上。

## 和 Android 版的差别

| | Android | Windows |
|---|---|---|
| 注入 | 改 APK，加载 `libkmod.so` | `dwmapi.dll` 代理，游戏文件不动 |
| 数据目录 | `/sdcard/Android/media/<包名>/kmod/` | `<游戏>\kards\Binaries\Win64\kmod\` |
| pak 模组 | 支持（`kmod/paks`） | 不支持 |
| 原生模组 | `arm64-v8a` 的 `.so` | `windows-x64` 的 `.dll`，同一份源码 |
| 原生模组的 UI / JNI 接口 | 有 | 没有（接口为空，见 `kmod.h`） |
| 开发工具 | 悬浮控制台 | 控制台窗口 |
| 游戏内 Mods 页 | 有 | 有（嵌在游戏设置页里） |
| 网络 | Java 的 `HttpURLConnection` / `SSLSocket` | WinHTTP / Winsock / SChannel（用系统证书和代理） |
| 崩溃处理 | 信号处理 | 结构化异常处理（向量化异常 + 顶层过滤器） |

Lua 模组本身通常不用区分平台。需要区分时用 `kmod.platform`（`"Windows"` 或 `"Android"`）。界面控件在两个平台上可能不同，见[开发版控制台](../guide/dev-console.md)的末尾。
