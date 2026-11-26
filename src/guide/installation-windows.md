# 安装（Windows）

Windows 版 kmod 是两个文件：一个 `dwmapi.dll`（代理）和一个 `kmod_core.dll`（核心）。放进游戏的程序目录，不需要改游戏本体、不需要管理员权限。

## 需要什么

- Windows 10 / 11，64 位。
- Steam 或官方启动器安装的 KARDS（已在 1.61、UE 5.6 上测过）。
- 到 [Releases](https://github.com/CCB-TEAM/KMod-Loader-Windows/releases) 下载：
  - `kmod-loader-windows-<版本>-release.zip`：正式版，日常使用。
  - `kmod-loader-windows-<版本>-dev.zip`：开发版，多一个控制台窗口和更详细的日志，写模组时用（见[开发版控制台](dev-console.md)）。

## 安装步骤

1. 关掉游戏。
2. 找到游戏的程序目录，也就是放着 `kards-Win64-Shipping.exe` 的那个：

   ```
   <游戏>\kards\Binaries\Win64\
   ```

3. 把压缩包里的 `dwmapi.dll` 和 `kmod` 文件夹复制到这个目录。
4. 启动游戏。

> [!WARNING]
> 如果这个目录里已经有 `dwmapi.dll`（比如 UE4SS 也是用 `dwmapi.dll` 注入的），先把它改名，例如 `dwmapi.dll.disable`。两个加载器不能同时占用这个名字。

## 目录

第一次启动后，`kmod` 文件夹里会出现：

```
<游戏>\kards\Binaries\Win64\
├── dwmapi.dll              # 代理：游戏启动时被加载，转发系统 dwmapi 的全部导出，并启动核心
└── kmod\
    ├── kmod_core.dll       # 核心
    ├── mods\               # 模组：文件夹，或 .kmod 文件
    ├── data\<id>\          # 模组的用户数据（设置值）
    ├── logs\               # kmod.log 等日志（保留最近 5 次）
    ├── state.json          # 启用列表和语言
    ├── boot\               # 崩溃保护的状态
    ├── net\                # 服务器重定向配置（可选）
    └── .private\           # 加载器自己用：模组的私有副本
```

Windows 版**没有 `paks` 文件夹**：不加载 pak 模组。

**装模组就是把文件放进 `kmod\mods\`**：模组文件夹或 `.kmod` 文件。加载器启动时，或者你打开 Mods 页时，会把它们同步到 `kmod\.private\mods\`（`.kmod` 自动解压）再从那里加载。你可以在游戏运行时替换 `mods\` 里的文件，下次同步时生效。

模组默认是**关闭**的。在游戏里启用：

- 设置页左侧的 **Mods** 标签。

## 确认装好了

- 设置页右下角出现 `kmod 0.4.0 release`（开发版是 `dev`）。
- 设置页左侧多一个 **Mods** 标签。
- `kmod\logs\kmod.log` 的第一行是 `=== kmod loader 0.4.0 (release, Windows) started ===`。

如果游戏起不来，或者没有出现 Mods 标签，看 `kmod\logs\kmod.log`；如果连 `kmod\logs` 都没有，看 `kmod\proxy.log`，里面会写代理没能加载核心的原因。

## 卸载

删掉 `dwmapi.dll`（需要的话连同 `kmod` 文件夹），游戏就恢复原样。加载器不修改游戏的任何文件。

## 更新

覆盖 `dwmapi.dll` 和 `kmod\kmod_core.dll`。`mods`、`data`、`state.json` 保持不变。

## 常见问题

**游戏显示崩溃或启动不了。** 连续几次没有正常走到稳定状态，kmod 会自动进入[安全模式](safe-mode.md)（不加载任何模组）。在开发版控制台里输入 `safe off` 可以退出安全模式。

**走了系统代理。** 模组的 `Http`、WebSocket 请求使用系统的代理设置（和浏览器一样）。
