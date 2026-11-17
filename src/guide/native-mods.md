
# C++ 模组

C++ 模组是一个 `arm64-v8a` 的共享库（`.so`），和 Lua 部分放在同一个包里。它适合 Lua 做不到或做得慢的事：钩引擎里没有反射信息的 C++ 函数、按签名找地址、每帧要跑的计算、链接现成的 C/C++ 库。

> [!WARNING]
> C++ 模组运行在游戏进程里，崩溃就是游戏崩溃。kmod 会记下是哪个模组，下次启动时自动把它关掉（见[安全模式](safe-mode.md)），但这一次的崩溃躲不掉。只装你信任的原生模组。

## 开始

模板在仓库的 `template/kmod-native-template/`：

```
my_native_mod/                  # 文件夹名 = 模组 id
├── mod.json                    # "format": 2, "platform": ["Android"], "native": "libmy_native_mod.so"
├── main.lua                    # 可选：模组的 Lua 部分
├── native/arm64-v8a/           # 编译出来的 .so 放这里
├── src/main.cpp                # 源码
├── include/kmod.h              # 唯一需要的头文件
├── CMakeLists.txt, build.ps1, build.sh
└── .clangd                     # 代码补全
```

1. 需要 Android NDK 和 CMake。运行 `build.ps1`（Windows）或 `build.sh`，库输出到 `native/arm64-v8a/`。
2. 把整个文件夹复制到手机的 `kmod/mods/<id>/`，或者压成 `.kmod`，在 Mods 页启用。
3. 第一次构建后会生成 `build/compile_commands.json`，clangd（VS Code、CLion 等）会自动用它做补全和跳转。

## mod.json

```json
{
  "format": 2,
  "platform": ["Android"],
  "native": "libmy_native_mod.so",
  "id": "my_native_mod",
  "version": "0.1.0"
}
```

`native` 是库的文件名，加载器在包里的 `native/arm64-v8a/` 找它。带 `native` 的模组必须是 `"format": 2` 并且写明 `platform`；`main.lua` 可以没有。

## 入口

库导出两个函数，`kmod.h` 里的宏替你写好了：

```cpp
#include "kmod.h"

static int OnStart() { KLOGI("hello"); return 0; }    // 返回非 0 = 启动失败
static void OnStop() {}
KMOD_MOD(OnStart, OnStop)                              // 第二个参数可以是 nullptr
```

`kmod_start(const KModApi*)` 在游戏线程调用一次。`KModApi` 是一张函数表，`kmod.h` 里每个字段都有注释；模组只通过它和 kmod 打交道，所以更新 kmod 不需要重新编译模组（表只会增加字段，用新字段前先看 `struct_size`）。

## KModApi（接口级别 1）

| 分类 | 内容 |
|---|---|
| 基本 | `mod_id`、`mod_dir`、`data_dir`（`kmod/data/<id>`，可写）、`log(level, msg)` |
| 游戏代码 | `image_base()`、`find_pattern("FD 7B ?? A9 ...")`、`hook_function(target, detour, &original)` |
| 反射 | `find_class`、`find_function("Class:Func")`、`find_first_of`、`property_offset`、`is_a`、`object_name`、`process_event` |
| 钩子和回调 | `hook_ufunction(fn, pre, post, user)`、`on_tick(fn, user)`（每秒约 20 次） |
| 界面（级别 2） | `ui_show(spec, cb, user)`、`ui_set(panel, id, value)`、`ui_close(panel)`；原始 JNI：`java_vm()`、`jni_env()`、`app_class_loader()`、`activity()`、`run_on_ui_thread(fn, user)` |
| Lua | `register_lua_function(name, fn)`：给模组的 `main.lua` 一个 `Native.<name>(...)`，只能在 `kmod_start` 里调用；`lua.*`：读参数、返回值、建表的栈函数 |

所有回调都在游戏线程。游戏对象是不透明的指针，通过反射数据访问：`property_offset(cls, "Health")` 得到偏移，再在钩子的 `params` 或对象指针上按偏移读写，`kmod::At<float>(params, off)`。

## 界面

C++ 模组可以用**普通的 Android 控件**画界面，不用游戏自己的 UI 控件。`ui_show` 接一段 JSON 描述，在游戏的 Activity 上弹出一个对话框（深色、圆角、中文正常显示、超出屏幕高度时可滚动）：

```cpp
kmod::ShowPanel(R"({
  "title": "My panel",
  "items": [
    {"type": "text",   "id": "info", "text": "Hello"},
    {"type": "switch", "id": "sw",   "text": "Enabled", "value": true},
    {"type": "slider", "id": "vol",  "text": "Volume", "min": 0, "max": 10, "value": 3.5},
    {"type": "edit",   "id": "name", "text": "hint", "value": "初始文字"},
    {"type": "choice", "id": "mode", "text": "Mode", "options": ["low", "medium", "high"], "value": "medium"},
    {"type": "button", "id": "go",   "text": "Go"}
  ]})",
  [](int panel, const char* id, const char* value) { KLOGI("%s = %s", id, value); });
```

| 控件 | 事件的 `value` |
|---|---|
| `button` | `"click"` |
| `switch` | `"true"` / `"false"` |
| `slider` | 松手时的数值 |
| `edit` | 按完成键或失去焦点时的文字 |
| `choice` | 选中的选项 |

- 关闭面板（点"Close"、点对话框外面、返回键或 `ui_close`）时收到 `id` 为 `"$close"` 的事件；面板建不出来时收到 `"$error"`，`value` 是原因。
- 面板级选项：`"modal": false`（点对话框外面可以操作游戏）、`"close": false`（不要底部的关闭按钮）、`"closeText"`。
- `ui_set(panel, "info", "新文字")` 改控件的值：文本改文字，开关传 `"true"`/`"false"`，滑块传数字，下拉传选项名。程序改的值不会再触发事件。
- 事件在游戏线程回调。`ui_show` 和 `ui_set` 可以在任何回调里调用。
- 实现：核心内嵌了一小段 Java（`overlay/kmodui/kmod/UiBridge.java`，用 `tools/build_uibridge.ps1` 编译成 dex），运行时用 `DexClassLoader` 从私有目录加载，不需要改 APK。
- 需要更多控件时用原始 JNI（悬浮按钮、自绘视图、系统悬浮窗、合成触摸都属于模组自己的事，加载器不内置）：`jni_env()` 给当前线程的 `JNIEnv*`，`app_class_loader()` 给游戏的类加载器（用它找游戏里的 Java 类）。Android 控件只能在 UI 线程上操作：`run_on_ui_thread(fn, user)` 把一个函数放到 UI 线程执行；`activity()` 返回游戏当前的 Activity（JNI 全局引用，下一次调用会替换它，不要自己删除），还没有窗口时是 null。
- 游戏线程是原生线程，不会回到 Java，所以在它上面创建的 JNI 局部引用（`NewStringUTF` 等）要自己 `DeleteLocalRef`。
- 模组需要自己的 Java 类（比如点击监听）时，把它编译成 dex 嵌进 `.so`，写到私有目录（只读），用 `DexClassLoader` 加载，父加载器用 `app_class_loader()`。`examples/native/float_button` 就是这样做的。

## 示例和模板

- 模板：`template/kmod-native-template`（最小）、`template/kmod-native-panel-template`（带设置面板，值存在 `data_dir` 里）。
- 示例：`examples/native/`：`lua_functions`（从 Lua 调用原生函数）、`param_reader`（钩游戏函数并按名字读参数）、`float_button`（自带 Java 类的可拖动悬浮按钮，用原始 JNI）。每个示例的构建方法见该目录的 README。

## 内联钩子

`hook_function` 改写目标函数开头的 16 字节。这 4 条指令里的 `ADR`、`ADRP`、`LDR`（字面量）、`B`、`BL` 会被重定位，条件分支（`B.cond`、`CBZ`、`TBZ` 等）不支持，此时返回失败。不要对同一个函数钩两次。

## 加载方式

共享文件夹在 Android 上是不可执行的挂载点，不能直接从那里加载库。启动时加载器把库复制到应用私有目录（只有大小或修改时间变了才重新复制，先写临时文件再改名），再从私有目录加载。已经不存在或被禁用的模组的私有副本会被清理。

- 原生库加载后不能卸载。禁用一个已加载的原生模组，要**重启游戏**才真正停止；Mods 页会提示。
- Lua 部分仍可热重载，但原生部分在一次游戏运行里只启动一次。
- 安全模式、崩溃隔离对原生模组同样有效：加载或运行时崩溃，下次启动该模组不会加载，直到你重新启用它。

## 编译注意

- 链接 `-static-libstdc++`，游戏没有 `libc++_shared.so`。
- 符号默认设成隐藏（`-fvisibility=hidden`），只有 `kmod_start`/`kmod_stop` 导出（宏已处理）。
- 目前只有 Android arm64。`platform` 字段为以后的 Windows 版预留。
