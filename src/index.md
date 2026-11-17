
# kmod loader

**kmod loader**（简称 **kmod**）是 KARDS 的 Lua 模组加载器。它不依赖 UE4SS，也不是 pak 模组：模组是你自己写的 Lua 脚本，通过虚幻引擎的反射系统读写游戏对象、调用游戏函数，还能加载 pak 里的资源。目前只有 Android 版，Windows 版在计划中。

| | |
|---|---|
| 加载器版本 | 0.3.0（`kmod.version`） |
| 接口级别 | 1（`kmod.api`） |
| 适配的游戏版本 | KARDS 1.61（UE 5.6，arm64） |
| 许可证 | MIT |

## 能做什么

- **Lua 5.4 模组**：读写属性、调用函数、挂钩子、定时器、监听新对象、加载资源。
- **`.kmod` 包**：一个 zip，带 `mod.json`、设置项、本地化和带版本条件的依赖（`kmod>=0.2.0`、`kards>=1.61`）。
- **游戏内 Mods 页**：嵌在游戏自己的设置界面里，启用、禁用、改设置、看状态。
- **控制台指令**：内置查询和管理指令，模组可以注册自己的指令。
- **日志与崩溃记录**：滚动日志文件，原生崩溃处理，崩溃信息写进日志。
- **开发版**：悬浮控制台、热加载核心和脚本。

## 从哪里开始

| 我想…… | 去看 |
|---|---|
| 装上加载器 | [安装](guide/installation.md) |
| 写第一个模组 | [第一个模组](guide/first-mod.md) |
| 理解钩子、游戏线程、对象有效性 | [概念](concepts/index.md) |
| 查某个函数怎么用 | [Lua API](lua-api/index.md) |
| 看现成的例子 | [示例](guides/examples.md) |
| 从 UE4SS 迁移脚本 | [从 UE4SS 迁移](guides/migrating-from-ue4ss.md) |

## 它是怎么工作的

```
官方 APK ──(改 SplashActivity，加 System.loadLibrary("kmod"))──▶ 打补丁的 APK
                                                                    │
libkmod.so（加载器壳） ──加载──▶ libkmodcore.so（核心）
                                    │ 内联 hook UObject::ProcessEvent（拿到游戏线程）
                                    ▼
                               Lua 5.4 虚拟机 ──▶ 模组（main.lua）
```

- 不需要 root：重新打包并签名 APK 后安装。
- 核心在游戏线程里运行 Lua，通过游戏自己的反射系统读写属性、调用函数。
- Mods 页直接嵌在游戏的设置界面里。

## 开发版与正式版

| | 开发版（dev） | 正式版（release） |
|---|---|---|
| 悬浮控制台 | 有 | 无 |
| 日志级别 | DEBUG 及以上 | INFO 及以上 |
| 热加载核心 / 覆盖内置脚本 | 支持（`kmod/dev/`） | 不支持 |
| 面向 | 模组作者 | 玩家 |

版本行显示在游戏设置页右下角，如 `kmod 0.3.0 release`。
