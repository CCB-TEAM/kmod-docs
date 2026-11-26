
# 更新日志

## KMod Launcher 1.2.1（2026-11-26）

- Android：禁止双指和双击缩放界面。

## KMod Launcher 1.2.0（2026-11-26）

- 启动器可以检查并安装自身的更新。
- 首次启动引导：选主题、设置 GitHub 代理（预设 `gh-proxy.com`、`gh-proxy.org`）。
- Android：引导里申请文件访问和「获取应用列表」权限，未授权时不能使用；修复 Android 10 及以下从不申请存储权限（`Operation not permitted`）。
- Android：沉浸模式，导航栏不再遮挡界面。

## KMod Launcher 1.1.0（2026-11-26）

- 「发现」页显示模组的下载量和 GitHub 星标数，点星标打开模组仓库；可以按下载量排序。
- [模组索引](guide/index-api.md)新增 `downloads` 字段。

## KMod Launcher 1.0.0（2026-11-26）

[KMod Launcher](guide/launcher.md)：Windows 和 Android 上的加载器安装器与模组管理器。新增「发现」页（浏览、下载社区模组）、模组图标、原生模组安装警告、含 Pak 模组包的安装与覆盖确认、模组页刷新、GitHub 下载代理；Android 版内置加载器 0.4.0 的安装器。

## 0.4.0（Android 与 Windows，2026-11-26）

- 模组包可以带 [Pak 模组](mod-format/paks.md)（`mod.json` 的 `paks`，按 SHA-256 校验），更新前提示；纯 pak 的包可以没有 `main.lua`。
- **网页界面**：[`UI.web`](lua-api/mod-env/web.md)，用 HTML / CSS / JavaScript 做无边框窗口，可拖动、缩放（松手后生效，带预览框）、限制最小和最大尺寸。
- **输入与文件**：[`Input`](lua-api/mod-env/input.md)（电脑端键盘）；[`Media`](lua-api/mod-env/media.md) 可以选图片、选任意文件、另存为、打 zip。
- **模组页**：新增「重载所有模组」按钮，每个已启用的 Lua 模组下有「重载」按钮；Lua 里是 [`kmod.reload_mod(id)`](lua-api/mod-env/kmod.md)。
- **工具函数**：`kmod.gif_frames`（把 GIF 拆成 PNG 帧，可裁切）、`kmod.base64`。
- 没有任何反射字段的引擎结构体（如 `FGeometry`）现在能原样传回引擎函数，`SlateBlueprintLibrary` 等可以用了。
- Windows 版不再标为预发布。
- Android：安装器更新到 0.2.0，内置加载器 0.4.0。
- Windows：调整启动时机，模组更早开始加载（可用 `kmod\boot\delays.txt` 调整）。

## 0.3.0（Windows，pre-release）

**Windows 版加载器**：和 Android 版同一套 Lua 宿主、模组加载脚本、反射层和 `kmod.h`，平台相关的部分重写。见[安装（Windows）](guide/installation-windows.md)、[Windows 版是怎么工作的](concepts/windows.md)。
- **注入**：`dwmapi.dll` 代理（99 个导出转发到系统库），不改游戏文件；核心在单独的线程里加载。
- **引擎地址**：全部运行时从 PE 映像里找（`GObjects`、`GNames`、`ProcessEvent`、Blueprint 解释器和 `GNatives`），不带写死的偏移。
- **x64 内联钩子**（Zydis）：重定位 RIP 相对寻址和相对跳转，安装时挂起其他线程。
- **布局检查**：启动时抽样验证反射层的结构偏移，不自洽就不加载模组。
- **开发版**：控制台窗口、对象转储（`dump objects`）、热加载脚本（见[开发版控制台](guide/dev-console.md)）。
- **C++ 模组**：`kmod.h` 级别 3，同一份源码可以编成 Android 的 `.so` 或 Windows 的 `.dll`；`mod.json` 的 `native` 可以按平台写成表 `{"Android": "...", "Windows": "..."}`；`api->platform`。见 [C++ 模组](guide/native-mods.md)。
- **网络**：WinHTTP（`Http`，用系统代理）、Winsock（TCP / UDP）、SChannel（TLS，用系统证书）。
- **没有的**：pak 模组（没有 `paks` 文件夹）、原生模组的 Android UI / JNI 接口。
- 修复了一批只在 Windows 上出现的问题：`ProcessEvent` 的虚表槽位、属性的 `ArrayDim` / `ElementSize` 偏移（Windows 与 Android 不同）、`.private` 目录创建、安全模式对短时间运行的误判。

Android 版同步：`kmod.h` 升到级别 3（`platform` 字段），`mod.json` 的 `native` 支持按平台的表。

## 0.3.0 Android

安卓版加载器 0.3.0：C++ 原生模组、包格式 2、UE4SS 兼容补齐、网络层、安装器。
- `Worker`：独立线程、独立 Lua 状态，消息通信（见 [Worker](lua-api/global-functions/worker.md)）；`ExecuteAsync`（别名）。
- `FastLoop`，`NotifyOnNewObject` 的快速模式；新对象检测改为比较槽位序号，不再漏掉被复用的槽位。
- `kmod/paks/` 里的 pak 启动后自动挂载，优先级高于游戏自带 pak（见 [Pak 模组](guide/pak-mods.md)）。
- 控制台指令 `paks`（可开关单个 pak）、`safe`、`unquarantine`、`selftest`。
- **版本抗性**：`GObjects`、`GNames`、`ProcessEvent`、pak 挂载函数改为运行时验证和查找，写死的偏移失效时自动重新定位，找不到时安静地不活动（见[版本支持](concepts/version-support.md)）。
- **崩溃保护**：记录崩溃时正在运行的模组或 pak，下次启动隔离它；原因不明的连续崩溃进入安全模式（见[崩溃保护](guide/safe-mode.md)）。
- pak 由核心在引擎就绪时挂载，比之前早约 5 秒。
- `Events`（模组间事件总线）、`Store`（模组的持久化存储）、`Mod.data_dir`。
- **游戏自身的网络**：服务器重定向（`kmod/net/server.json`，运行时修改内存里的服务器地址，不用重打包）；[`Net`](lua-api/mod-env/net.md)（观察、修改游戏收到的 WebSocket 消息，连接状态，`Net.send`），权限 `game_network`。
- **模组的网络**：[WebSocket 客户端、TCP（可选 TLS）、UDP](lua-api/mod-env/sockets.md)；`Http.download` 流式下载到文件，带进度。
- 钩子里给字符串参数赋值现在可用（引擎分配的副本）。
- **自定义界面**：[`UI`](lua-api/mod-env/ui.md)（`UI.window`、`toast`），用游戏自己的控件搭窗口。
- **网络**：[`Http`](lua-api/mod-env/http.md)（`get`、`post`、`request`），需要 `mod.json` 声明 `permissions: ["network"]`。
- **布局检测与缓存**：用 MobileDumper-7 的检测在游戏进程里取得引擎的结构布局，按游戏版本缓存，和核心里的 SDK 对比；不一致时不加载模组（见[版本支持](concepts/version-support.md)）。控制台 `layout`。
- **运行时反射布局**：核心的反射读取改走 `reflect.h` 的运行时布局表，检测到的引擎布局会被采用；引擎函数按类名、函数名、参数名调用，不再用 SDK 强类型包装。布局偏移变了不必重编译核心（见[版本支持](concepts/version-support.md)）。
- **安装器**（Android 应用）：在手机上选游戏、检查、注入、签名并安装，不需要电脑（见[安装器](guide/installer.md)）。
- 核心启动时就创建 `mods`、`paks`、`data` 目录。
- **`inbox` 文件夹取消**：模组文件夹和 `.kmod` 文件统一放进 `kmod/mods/`。加载器启动（和打开 Mods 页）时把它们同步到应用的私有目录再加载：文件夹复制，`.kmod` 自动解压；原文件保留，删除后私有副本跟着删除。C++ 原生模组的库也因此不再需要再复制一次。
- **注入工具**（`tools/kmod_inject.py`）：检查 APK 能不能注入（引擎库、启动类、防篡改、是否已注入），并生成注入后已签名的 APK。启动类从清单读出，不再写死 `SplashActivity`。见[注入工具](guide/injector.md)。
- **核心的版本依赖**：包名运行时读取；`FFrame` 偏移运行时学习；启动自检（金丝雀）验证对象表、`FString`、`FText`、`TArray` 布局，不对就不加载模组。
- **C++ 模组**：`mod.json` 的 `native` 字段，库先复制到私有目录再加载；`kmod.h` 提供稳定的 C 接口（内联钩子、签名扫描、反射、UFunction 钩子、tick、注册 Lua 函数）；模板 `kmod-native-template`；内联钩子能重定位开头 4 条指令里的 `ADR/ADRP/LDR/B/BL`。见 [C++ 模组](guide/native-mods.md)。
- **C++ 模组的界面**（接口级别 2）：`ui_show`/`ui_set`/`ui_close`，用普通 Android 控件（开关、滑块、输入框、下拉、按钮）在游戏上弹出面板，不依赖游戏的 UI 控件；另有原始 JNI 接口。见 [C++ 模组](guide/native-mods.md)。
- **包格式 2**：`mod.json` 新增 `platform`（`Android`、`Windows`，可多选；缺省 = 所有平台）。当前平台不在列表里的模组显示"不适用于本平台"，不加载。`format` 接受 1 和 2。
- **UE4SS 兼容补齐**（见 [UE4SS 兼容](lua-api/global-functions/ue4ss-compat.md)）：钩子回调的返回值可替换函数返回值；延迟动作句柄一整套（`MakeActionHandle`、`ExecuteInGameThreadWithDelay`、`LoopInGameThread*`、`Pause/Cancel…`）；`RegisterBeginPlay/EndPlay/InitGameState/LoadMap/ProcessConsoleExec` 钩子、`RegisterCustomEvent`、`RegisterCustomProperty`；`StaticConstructObject`、`ForEachUObject`、`FindObjects`、`LoadExport`、线程查询、`DumpAllObjects/Actors`、模组重启/卸载；对象方法 `IsChildOf`、`GetSuperStruct`、`ForEachProperty/Function`、`get`；`TMap`/`TSet` 可读、`TMap` 值可原位修改；委托属性（`Broadcast`、`Execute`、`IsBound`、`GetBindings`、`Clear`）；`FString`/`FText` 属性可写，数组可原位写。
- **原生函数钩子**：蓝图虚拟机直接调用的原生函数也能钩了（参数可读可改），`GNatives` 在运行时从解释器里定位。`Net.on_send`、`Net.on_open` 补齐。
- **蓝图脚本函数钩子**：`RegisterHook` 现在钩在引擎执行蓝图字节码的解释器上，能看到**所有**蓝图函数调用（包括蓝图直接调蓝图，之前完全看不到），参数可读可改，后置回调里能读返回值（见[钩子](concepts/hooks.md)）。
- 修复：`GetName()` 曾在反射改造后多出实例编号后缀（`ScaleBox_2`），导致 Mods 页找错控件，已恢复。
- **心跳**：用引擎定时器驱动 tick，游戏静止时定时器不再停摆（之前在静止画面上 `ExecuteWithDelay(300)` 可能拖到几十秒）。
- UObject 句柄现在也比较槽位序号，对象被销毁、槽位被复用后旧句柄不会指向新对象。

**Lua API**
- 查找：`FindFirstOf`、`FindAllOf`、`FindObject`、`StaticFindObject`、`CreateInvalidObject`。
- 资源：`LoadAsset`（同步加载 pak 内容）；`obj:GetPathName()`。
- 钩子与定时：`RegisterHook`、`UnregisterHook`、`ExecuteWithDelay`、`ExecuteInGameThread`、`LoopAsync`、`NotifyOnNewObject`。
- 模组环境：`Mod`、`Log`、`Settings`、`Lang`、`Console`、`require`、`kmod`。

**工具**
- 控制台指令系统：`help`、`version`、`mods`、`enable`、`disable`、`reload`、`lang`、`settings`、`log`、`find`、`search`、`props`、`funcs`（带参数类型）、`hook` / `unhook` / `hooks`（监听函数调用并打印参数）、`typegen`（生成 LuaLS 类型声明），模组可注册指令。
- 日志：滚动文件日志（保留 5 次运行），原生崩溃处理写入 `FATAL` 回溯。

**数据位置**
- 所有数据放在共享存储的 `Android/media/<包名>/kmod/`：游戏不需要存储权限，文件管理器和 `adb` 放进去的文件游戏都读得到；旧位置的数据首次启动时自动搬迁。

**已知缺口**
- 只有 Android（Windows 版见上面的 Windows 条目）。
- 没有 USMAP / SDK 头文件转储（`DumpAllObjects`、`DumpAllActors` 有）。
- 安装器和注入工具只处理完整 APK，分包安装的应用暂不支持。

## 0.2.0

首个有文档的版本（Android，KARDS 1.61）。

**加载器**
- 无 root：重新打包并签名 APK，`SplashActivity` 静态初始化里加载 `libkmod.so`，再加载核心。
- 内联钩子 `UObject::ProcessEvent`，Lua 5.4 运行在游戏线程上。
- 开发版 / 正式版两种构建；开发版有悬浮控制台、热加载核心和脚本。

**模组**
- `.kmod` 包格式（format 1）：`mod.json`、`main.lua`、`lang/*.json`；包和用户数据分开。
- 设置项：`bool`、`number`、`choice`、`string`。
- 依赖：`id` 加版本条件（`>=`、`>`、`<=`、`<`、`=`，逗号分隔），保留 id `kmod`（加载器）和 `kards`（游戏，只取前两段版本）。
- 本地化：12 种语言标签，回退链 `zh-CN → zh → en → 默认文字 → 键名`。
- 脚本报错自动禁用：钩子、定时器、新对象回调累计 10 次错误。
- 游戏内 Mods 页：嵌在设置界面，跟随游戏的 UI 缩放，显示名称、说明、版本、状态、启用开关和设置项。
