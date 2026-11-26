# KMod Launcher

KMod Launcher 是加载器的安装器和模组管理器，有 Windows 和 Android 两个版本。到 [Releases](https://github.com/CCB-TEAM/KMod-Launcher/releases) 下载。

| 文件 | 说明 |
|---|---|
| `KMod-Launcher-*-windows-x64.exe` | Windows 10 / 11，单文件，直接运行（需要系统的 WebView2） |
| `KMod-Launcher-*-android-arm64.apk` | Android 8 及以上，64 位 ARM |

## 安装加载器

- **Windows**：启动器在 Steam 库里找 KARDS（也可以手动选目录），在「加载器」页安装、更新或卸载，可以选正式版或开发版。下载线路可选直连或 gh-proxy.com。
- **Android**：在「安装器」页选 KARDS，启动器把内置的加载器注入游戏并安装。注意事项和[安装器](installer.md)相同：签名会改变，必须先卸载原版。管理模组需要在系统设置里允许「所有文件访问」。

## 发现

「发现」页列出社区模组，可以搜索、按类型筛选和排序。默认只显示和当前加载器、游戏版本兼容的模组。下载的文件按索引里的 SHA-256 校验，装好后自动启用，下次启动游戏时生效。

> [!WARNING]
> 模组是自动收录的，没有人工审核。原生 C++ 模组能在游戏进程里执行任意代码，每次安装或更新前启动器都会弹出警告。只安装你信任的作者发布的模组。

模组列表来自 [kmod-index](https://github.com/CCB-TEAM/kmod-index)（格式见[模组索引 API](index-api.md)）。在设置里可以填别的索引地址，每行一个。

## 模组

列表可以用「刷新」重新读取。启用、停用、删除模组，安装本地的 `.kmod` 和 `.pak` 文件。带 pak 的模组包会把 pak 装进常规目录；覆盖或删除 pak 之前会列出文件让你确认，删除模组时询问是否一起删除它的 pak，见[模组包里的 Pak](../mod-format/paks.md)。

## 网络

设置里可以填 HTTP / SOCKS5 代理，以及 GitHub 代理前缀（例如 `https://gh-proxy.com`）。版本列表和索引先直连，失败时才经过前缀代理。
