
# 版本支持与地址解析

kmod 要在游戏里找到几样东西：对象表（`GObjects`）、名字表（`GNames`）、`ProcessEvent`，以及 pak 挂载函数。这些地址每个游戏版本都可能变。kmod 不再信任一份写死的偏移，而是在启动时**验证，不对就重新找**。

| 目标 | 做法 |
|---|---|
| `GObjects` | 先检查 SDK 导出时记下的偏移；不是有效的对象数组就扫描引擎的数据段，找符合对象数组结构的位置 |
| `GNames` | 同上；扫描时找"第一个名字块的开头是 `None`"的结构，并用 SDK 的名字解码再确认 |
| `ProcessEvent` | 直接读任意 `UObject` 的虚表第 77 槽（虚表下标在同一引擎版本里不变），不依赖代码地址 |
| `GWorld` | 不再使用，改由引擎对象的 `GameViewport` 取得 |
| pak 挂载 | 在引擎里找日志字符串 `Mounting pak file: %s`，再在内存里找绑定了对应函数的委托对象，取出 `FPakPlatformFile`；挂载 worker 通过它读参数结构的指令特征识别 |

日志（`kmod/logs/kmod.log`）里能看到用的是哪种方式：

```
I/resolver: GObjects: dumped offset 0xa1d5fc0 is valid
I/resolver: GNames: found by scanning at 0xa17c000
I/core: pak layer: mount fn 0x4dc0218 worker 0x4dc30f0 pak file 0x4fedc96000
```

## 找不到时

- 对象表或名字表找不到：kmod 写一条错误日志（`this game build is not supported`），**保持不活动**，游戏照常运行，不加载任何模组。
- 只有 pak 层找不到：写警告，`kmod/paks` 不挂载，其他功能不受影响。

## 布局检测与缓存

地址只是一半。SDK 里 `UObject`、`UStruct`、`UFunction`、`FField`、各种 `Property` 的**成员偏移**是编译进核心的，游戏更新改了布局时，旧偏移会读到错误的数据甚至崩溃。所以核心启动时会**对照引擎的真实布局**检查一遍：

1. 用 [MobileDumper-7](https://github.com/MJx0/MobileDumper-7)（MIT）的引擎布局检测，在游戏进程里直接分析内存，得到各个偏移。它被编译成独立的 `libkmodmd7.so`，需要时才加载（避免它自带的 Unreal 包装类和核心里的 SDK 同名冲突）。
2. 检测结果按**游戏库的版本指纹**（映射大小加代码前 1 MB 的 CRC）缓存到 `kmod/boot/layout-<指纹>.json`。同一版本只检测一次（约 15 秒），之后启动直接读缓存对比，不耗时。
3. 与核心里编译进来的 SDK 布局逐项比较（目前 20 项：`UObject`、`UField`、`UStruct`、`UFunction`、`FField`、`Property` 的关键成员，以及 `ProcessEvent` 的虚表下标）。

结果：

| 情况 | 处理 |
|---|---|
| 全部一致 | 正常加载模组 |
| 有差异（引擎的结构偏移挪了） | **采用引擎的真实布局**：核心的反射读取全部走运行时布局表，日志写警告并列出差异项，模组照常加载 |
| `ProcessEvent` 虚表下标变了，或检测不出任何一项 | **不加载任何模组**（这两种情况无法适应），状态写明原因。游戏本身不受影响 |
| 第一次遇到新版本（没缓存） | 模组等检测完成（约 15 秒）后才加载；检测器不可用时记警告，**照常加载**（未验证） |

控制台：

```
layout            显示验证结果
layout redetect   忽略缓存，重新检测（约 15 秒；之后用 reload 重新加载模组）
```

`libkmodmd7.so` 目前是**开发版的可选组件**：放在 `kmod/dev/libkmodmd7.so`。没有它时，没有缓存的新版本会是"未验证"状态。构建它需要 MobileDumper-7 的源码（CMake 变量 `KMOD_MD7_DIR`，并初始化它的 `libs/KittyMemoryEx` 子模块）。

## 运行时布局表

核心里所有读取反射数据的代码（对象的类、名字、外层，`UStruct` 的父类和成员链，`UFunction` 的标志和参数大小，`FField` 链，`FProperty` 及各子类的偏移，`UClass` 的默认对象）都不再用编译进来的 SDK 成员，而是通过 `reflect.h` 里的访问器读取一张**运行时布局表**：默认值取自编译进来的 SDK，检测到的值（来自 `layout.json`）会覆盖它。需要调用引擎函数（`Concat_StrStr`、`K2_SetTimer`、`GetPlayerController` 等）时，也是按**类名和函数名**在反射里查找、按参数名填值，不再用 SDK 的强类型包装。游戏引擎对象（`GameEngine`、`GameViewport`、`World`）也是按属性名读取。

所以游戏更新只改动这些结构偏移时，不重编译核心也能继续运行。

## 仍然编译进核心的部分

- **`ProcessEvent` 的虚表下标**（编译期常量）：变了就无法适应，核心不加载模组。
- **对象数组和名字池的布局**（`FUObjectItem` 步长、`FNamePool` 结构）：由 SDK 的访问器读取，检测结果里暂未采用。
- **`FText` 的结构**（`TextData` 偏移、大小）和少数引擎值类型（`FString`、`FName` 的大小）。

遇到这些变化，仍需用新版本重新导出 SDK 并重新构建核心。

## 开发用开关

在开发版里，`kmod/dev/force_scan` 文件存在时，核心会忽略导出的偏移，强制走扫描路径，用来测试扫描逻辑。

## 还写死的东西（审计）

核心的地址和反射结构偏移大部分已经是运行时获取，下面是**仍然来自编译进去的值**的清单，按"游戏更新后会不会坏"排序。更新后坏了的表现统一是：检测到不一致就不加载模组（见上面的"不一致时"），而不是乱写内存。

| 项目 | 现在怎么来的 | 更新后的风险 | 可以怎么动态化 |
|---|---|---|---|
| `GObjects`、`GNames`、`ProcessEvent` 的地址和下标 | 运行时验证加扫描 | 低 | 已动态 |
| 反射结构的字段偏移（`UObject`、`UStruct`、`UFunction`、`FProperty` 等 20 多项） | 默认值来自 SDK，由 MobileDumper-7 检测后覆盖，按版本缓存 | 低 | 已动态 |
| pak 挂载函数、`GNatives`、蓝图解释器 | 按指令特征和日志字符串运行时查找 | 低 | 已动态 |
| `FFrame` 的 `Node`/`Object`/`Locals`/`Code`/`PropertyChain` 偏移 | **运行时学习**：`ProcessEvent` 自己建栈帧，内容是已知的（函数、对象、参数块、字节码指针），在解释器收到的栈帧里找这些值，多数票决定；默认值是 UE 5 的偏移，学不到就保留默认并在日志里警告。之后还有前 2000 次调用的验证 | 低 | 已动态 |
| `UStruct` 的 `Script`（字节码）和 `MinAlignment` | `MinAlignment` 用检测器的值；`Script` 紧跟其后，由栈帧学习间接验证（`Code` 指针等于 `Script` 数据指针） | 低 | 已动态 |
| `FUObjectItem` 的序列号偏移 `0x10` | 来自 SDK，**启动时抽样验证**：4000 个值都像小的非负整数才信任，否则关掉序列号检查（句柄只靠指针比对） | 低 | 已验证；还没有直接探测 |
| `TUObjectArray` 的分块结构、`FUObjectItem` 的步长 | 来自 SDK；解析 `GObjects` 时按固定布局验证，引擎就绪后再用**金丝雀检查**：抽样 4000 个对象，每个对象自己的 `Index` 必须等于它在表里的槽位，不到 99% 就不加载模组 | 低 | 已验证（不符时拒绝，不自适应） |
| `FString`/`FText`/`TArray` 布局 | 来自 SDK；**金丝雀检查**：用引擎函数拼接字符串、字符串和文本互转、读 `GameInstance.LocalPlayers`，结果必须对。`FString` 不对就不加载模组，`FText`/`TArray` 不对只警告 | 低 | 已验证（不符时拒绝或警告） |
| `TMap`/`TSet` 的稀疏数组布局 | 固定；读取时自带检查（位数必须等于元素数，否则当作空） | 低 | 已验证 |
| 反射层假设 `FField` 属性系统（UE 4.25 及以后） | 编译时 | 低（KARDS 是 UE5） | 不需要 |
| 包名 | 现在**运行时**从进程名读（之前写死） | 无 | 已动态：核心、加载器和 `Android/media` 路径都不再写死包名 |
| `Net` 模块的 `WebSocketSubsystem`、`BP_KardsSession_C` 等类名 | KARDS 专属 | 取决于游戏更新 | 不通用，属于 KARDS 专属功能 |
| 服务器重定向的三个字符串字面量 | 按内容在库里查找 | 低 | 已动态 |

注意"来自 SDK"指的是编译核心时用的 Dumper-7 头文件里的值，不是运行时读到的值。

## 金丝雀检查

引擎就绪后、任何模组运行之前，核心会做一次自检并写进日志（`canaries: object table ok (4096/4096 ...); FString ok; FText ok; TArray ok`）。它检查的都是编译进核心的布局：对象表的几何结构、`FString`、`FText`、`TArray`。对象表和 `FString` 不对时，所有模组读到的都是乱码，所以核心直接把模组全部挡住并在日志和 `layout` 控制台命令里说明原因；`FText` 和 `TArray` 不对只警告。这样游戏更新后，最坏的结果是"模组没加载，原因写在日志里"，而不是读写错误的内存。

## Windows 版

Windows 版同样不信任写死的偏移，而是扫描游戏的 PE 映像，方法见 [Windows 版是怎么工作的](windows.md)。`ProcessEvent` 在 Windows 上是虚表的第 76 槽（Android 的 Itanium ABI 多一个析构槽，是第 77 槽），但 kmod 不依赖这个数字：它在候选函数里按代码特征找，并取最接近 76 的。
