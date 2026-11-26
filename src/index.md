---
layout: home
title: 首页
hero:
  name: kmod loader
  text: KARDS 的模组加载器
  tagline: 用 Lua 或 C++ 写模组，Windows 和 Android 通用。不依赖 UE4SS，不改游戏资源。
  image:
    src: /logo.png
    alt: kmod
  actions:
    - theme: brand
      text: 安装加载器
      link: /guide/launcher
    - theme: alt
      text: 写第一个模组
      link: /guide/first-mod
    - theme: alt
      text: 查 API
      link: /lua-api/
features:
  - icon: 🧩
    title: 装模组
    details: 用 KMod Launcher 安装加载器，在「发现」页浏览和下载社区模组。
    link: /guide/launcher
    linkText: KMod Launcher
  - icon: 📜
    title: Lua 模组
    details: 通过虚幻引擎的反射系统读写对象、调用函数、挂钩子，支持热重载。
    link: /guide/first-mod
    linkText: 第一个模组
  - icon: 📦
    title: .kmod 包
    details: 清单、设置项、本地化、带版本条件的依赖，还可以带 Pak 文件。
    link: /mod-format/
    linkText: 模组包格式
  - icon: 🎨
    title: 做界面
    details: 用游戏自己的控件，或者用 HTML / CSS / JavaScript 做窗口。
    link: /guides/ui
    linkText: 做界面
  - icon: ⚙️
    title: C++ 模组
    details: 同一份源码编成 Android 的 .so 或 Windows 的 .dll。
    link: /guide/native-mods
    linkText: C++ 模组
  - icon: 🚀
    title: 发布分享
    details: 给仓库加上 kmod-mod 主题并发一个 Release，就会出现在「发现」页。
    link: /guide/publishing
    linkText: 发布模组
---

## 当前版本

| | |
|---|---|
| 加载器版本 | 0.4.0（`kmod.version`） |
| 接口级别 | 1（`kmod.api`） |
| 适配的游戏版本 | KARDS 1.61（UE 5.6）：Android arm64、Windows x64 |
| 许可证 | MIT |

## 它是怎么工作的

Android 版如下；Windows 版见 [Windows 版是怎么工作的](concepts/windows.md)。

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

版本行显示在游戏设置页右下角，如 `kmod 0.4.0 release`。
