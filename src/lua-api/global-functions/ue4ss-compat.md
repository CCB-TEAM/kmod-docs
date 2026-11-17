
# UE4SS 兼容

kmod 的 Lua API 以 UE4SS 为蓝本。这一页列出和 UE4SS 一致的部分、用别的办法近似的部分，以及不支持的部分。按键监听（`RegisterKeyBind`）不在范围内。

## 一致

| 功能 | 说明 |
|---|---|
| `RegisterHook` | 前置/后置回调、回调返回值替换函数返回值。蓝图函数和原生函数都能钩（见[钩子](../../concepts/hooks.md)）。**回调的参数约定不同**：kmod 传 `(self, params)`，`params` 按名字读写；UE4SS 传一个个参数包装 |
| 延迟动作 | `MakeActionHandle`、`ExecuteInGameThreadWithDelay`（两种重载）、`RetriggerableExecuteInGameThreadWithDelay`、`LoopInGameThreadWithDelay`、`CancelDelayedAction`、`PauseDelayedAction`、`UnpauseDelayedAction`、`ResetDelayedActionTimer`、`SetDelayedActionTimer`、`ClearAllDelayedActions`、`IsValidDelayedActionHandle`、`IsDelayedActionActive`、`IsDelayedActionPaused`、`GetDelayedActionRate`、`GetDelayedActionTimeRemaining`、`GetDelayedActionTimeElapsed`。句柄属于创建它的模组 |
| 对象 | `StaticConstructObject(class [, outer])`（经 `GameplayStatics.SpawnObject`，没有名字和标志参数）、`ForEachUObject(fn(object, chunk, index))`、`FindObjects(count, class, name, requiredFlags, bannedFlags, exact)`、`LoadExport(symbol)`（`dlsym`） |
| 线程 | `IsInGameThread`、`IsInMainModThread`、`GetGameThreadId`、`GetMainModThreadId`、`GetCurrentThreadId`、`IsInAsyncThread`（模组的 Lua 都在游戏线程，恒为 false；真正的异步见 [`Worker`](worker.md)） |
| 转储 | `DumpAllObjects([file])`、`DumpAllActors([file])`，写进 `kmod/logs/`，返回路径和条数；`GenerateLuaTypes` |
| 模组管理 | `RestartCurrentMod`、`RestartMod`、`UninstallCurrentMod`、`UninstallMod`。kmod 只能整体重新加载，所以"重启"会重新加载所有模组；"卸载"= 禁用并重新加载 |
| 其他 | `FString`、`FAnsiString`（字符串本来就是 Lua 字符串）、`Print`、`PrintLn`、`PropertyTypes` |

## 对象方法

`IsValid`、`GetFullName`、`GetName`、`GetFName`、`GetClass`、`GetDefaultObject` / `GetCDO`、`GetPathName`、`GetOuter`、`GetAddress`、`IsA`、`GetPropertyValue`、`SetPropertyValue`、`CallFunction`、`GetProperties`、`GetFunctions`，以及：

- `cls:IsChildOf(other)`、`cls:GetSuperStruct()`
- `struct:ForEachProperty(fn({ name, type, offset, owner }))`、`struct:ForEachFunction(fn(function))`：回调返回 true 停止
- `obj:get()` / `obj:Get()`：返回对象本身，UE4SS 回调里的 `Context:get()` 写法可以直接用

## 属性类型

| 类型 | 读 | 写 |
|---|---|---|
| 数值、布尔、枚举、`FName`、对象 | 是 | 是 |
| `FString`、`FText` | 是 | 是（新文本由引擎分配，旧缓冲区会小量泄漏） |
| 结构体 | 是（表） | 是（表） |
| `TArray` | 是（表） | **原位**：表的长度必须等于数组当前长度，不能增减 |
| `TMap` | 是：简单键（数值、字符串、`FName`、枚举）读成 `{ [key] = value }`，其他键读成 `{ { key = , value = }, ... }` | **原位**：改已有键的值；不能增删条目 |
| `TSet` | 是（数组） | 否 |
| 委托（单播、多播） | 代理对象：`IsBound()`、`GetBindings()`、`Execute(...)`、`Broadcast(...)`、`Clear()` | 不能绑定新目标 |

委托代理指向所属对象的内存，取到后马上用。`MulticastSparseDelegateProperty` 读成 nil。

`RegisterCustomProperty({ Name = , Type = , BelongsToClass = , OffsetInternal = })`：给类加一个不在反射数据里的属性，`Type` 写 `PropertyTypes.IntProperty` 这样的名字，支持整数、浮点、布尔字节、对象指针。

## 近似实现

UE4SS 钩的是引擎里不被反射的 C++ 函数时，kmod 用等价的观察代替：

| 函数 | kmod 的做法 |
|---|---|
| `RegisterBeginPlayPre/PostHook`、`RegisterEndPlayPre/PostHook` | 钩所有类的 `ReceiveBeginPlay` / `ReceiveEndPlay`，每 10 秒补钩新加载的类；同一个演员只报一次。回调参数是演员对象 |
| `RegisterCustomEvent(name, fn)` | 钩所有叫这个名字的蓝图函数，方式同上 |
| `RegisterInitGameStatePre/PostHook` | `GameStateBase` 的新对象出现时触发（Post 晚 100 毫秒） |
| `RegisterLoadMapPre/PostHook` | 游戏视口的世界对象变化时触发，回调 `(engine, nil, worldName)`（Post 晚 300 毫秒） |
| `RegisterProcessConsoleExecPre/PostHook` | 钩 `PlayerController:ConsoleCommand` 和 `KismetSystemLibrary:ExecuteConsoleCommand`；回调 `(context, fullCommand, parts)`，返回值不能取消命令 |
| 帧延迟（`…AfterFrames`） | 按每秒 60 帧换算成时间 |
| 定时精度 | 延迟动作由 `FastLoop` 驱动，几毫秒的精度 |

## 不支持

`RegisterULocalPlayerExecPre/PostHook`、`RegisterCallFunctionByNameWithArgumentsPre/PostHook`、`GenerateSDK`、`GenerateUHTCompatibleHeaders`、`DumpUSMAP`、`DumpJMAP`、`DumpStaticMeshes`：调用时只在日志里警告，不会报错。`TSet` 写入、`TMap` 增删、数组增减、委托绑定新目标、`UEnum` 和 `UScriptStruct` 的独立 Lua 对象也没有。
