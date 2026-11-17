
# 安装

kmod 以打过补丁的 APK 形式发布，不需要 root。你需要官方渠道获得的 KARDS APK。

**最简单的办法**：用[安装器](installer.md)，它在手机上完成检查、注入、签名和安装。下面是手动的做法（电脑上用[注入工具](injector.md)，或者自己构建）。

1. 按[构建加载器](../guides/building.md)生成 `kards_mod.apk`（正式版）或 `kards_mod_dev.apk`（开发版）。
2. 安装。补丁 APK 用你自己的签名，和官方签名不同，所以不能覆盖安装官方版：需要先卸载官方版，或者覆盖同一把签名的旧补丁版（`adb install -r`）。
3. 启动游戏。首次启动会在 `/sdcard/Android/media/com.android1939.kardsapk/kmod/` 下创建 `mods`、`inbox`、`paks`、`data` 等目录。

> [!WARNING]
> 换签名后装不上官方版，卸载会清掉应用数据。安装前先备份存档。

不要公开分发补丁后的 APK：里面有游戏本体。

## 目录

kmod 的所有文件都放在手机的共享存储里：

```
/sdcard/Android/media/com.android1939.kardsapk/kmod/
├── mods/<id>/          # 已安装的模组（文件夹形式）
├── paks/               # pak 模组（启动时自动挂载）
├── data/<id>/          # 模组的用户数据（设置值）
├── inbox/              # 放 .kmod 包，下次启动或打开 Mods 页时自动安装
├── logs/               # kmod.log 等日志
├── state.json          # 启用列表和语言
└── dev/                # 仅开发版使用
```

**装模组就是把文件放进去**：把模组文件夹放进 `mods/`，或把 `.kmod` 文件放进 `inbox/`，不需要 `adb`。可以用手机的文件管理器，也可以用 USB 连电脑，或者 `adb push`。

> [!NOTE]
> 这个位置是应用的 `Android/media` 目录：游戏不需要任何存储权限就能读写，文件管理器和编辑器也能打开，别的程序或 `adb` 放进去的文件游戏也读得到。我在 Android 16 的 vivo 手机上试过，`Documents`、`Download` 这类公共目录不行（游戏读不到不是它自己创建的文件），`Android/data` 则在新版 Android 上多数文件管理器打不开，所以选了 `Android/media`。

**从旧版本升级**：早期版本的数据在 `/sdcard/Android/data/com.android1939.kardsapk/files/kmod/`。第一次启动新版本时，如果新位置还没有数据，加载器会把旧位置的 `mods/`、`data/`、`inbox/` 和 `state.json` 搬过去，并在旧目录里留一个 `MOVED.txt`。旧的日志和 `dev/` 不会搬。

## 确认装好了

- 游戏设置页右下角出现 `kmod 0.3.0 release`（开发版是 `dev`）。
- 设置页左侧多一个 **Mods** 标签。
- `kmod/logs/kmod.log`（在上面的 `kmod` 目录里）第一行是 `=== kmod loader 0.3.0 (release) started ===`。
