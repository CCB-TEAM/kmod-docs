
# 构建加载器

只想写模组的话不需要看这页，拿现成的 APK 装上即可。

> [!WARNING]
> **不要公开分发补丁后的 APK**：里面有游戏本体。只公开加载器的源码和模组。

## 仓库结构

```
build.ps1              # 一键构建：build.ps1 -Flavor dev|release
loader/                # libkmod.so：加载器壳，被 SplashActivity 的静态初始化加载
core/                  # libkmodcore.so：核心（hook、Lua 虚拟机、反射、日志）
├── src/               # C++：core.cpp、lua_host.cpp、kmod_log.cpp ...
└── lua/               # modloader.lua（加载与依赖）、modmanager.lua（Mods 页）、commands.lua（控制台指令）
overlay/kmod/Overlay.java   # 仅开发版：悬浮控制台（打成 classes2.dex）
tools/                 # DexTool.java（给 SplashActivity 加 loadLibrary）、repack.py
docs/                  # 本文档
```

## 需要的东西

| 东西 | 用途 |
|---|---|
| 官方 KARDS APK | 被打补丁的原包 |
| Android SDK（build-tools 36、platform 35）和 NDK 28.2 | 编译、对齐、签名 |
| CMake、Python 3、JDK 17+ | 构建脚本与 dex 工具 |
| smali / dexlib2 的 jar | `DexTool` 修改 `classes.dex`（Android Studio 自带一份） |
| 游戏的 C++ SDK（Dumper-7 / MobileDumper-7 转储） | 编译 `core` 时的类型和偏移 |
| Lua 5.4 源码 | 现在取自 UE4SS 的 `deps/first/LuaRaw`（MIT），任何 5.4 源码都行 |

`core/CMakeLists.txt` 的 `KMOD_SDK_DIR`、`KMOD_LUA_DIR` 指向这两份源码，`build.ps1` 里写着 SDK、NDK、Android Studio 的路径，换机器时按需修改。

签名用的 `dev.keystore` 不在仓库里，自己生成一个（别名 `dev`，口令 `android`，与 `build.ps1` 一致）：

```powershell
keytool -genkeypair -keystore dev.keystore -alias dev -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=kmod dev"
```

把原版 APK 放到 `build.ps1` 里写的路径（`kards-1.apk`），并把原包的 `classes.dex` 解压到 `x/classes.dex`。

SDK 里的 `Offsets::ProcessEvent` 必须和你的 APK 版本一致：**游戏更新后要重新转储**并重新编译，否则 hook 位置不对会直接崩溃。

## 构建

```powershell
cd android
.\build.ps1 -Flavor dev       # 生成 kards_mod_dev.apk
.\build.ps1 -Flavor release   # 生成 kards_mod.apk
```

脚本依次做这些事：

1. 用 CMake 编译 `loader`（`libkmod.so`）和 `core`（`libkmodcore.so`），开发版带 `-DKMOD_DEV=ON`。
2. 剥离符号后放进暂存目录。
3. 用 `DexTool` 从原包的 `classes.dex` 重新生成打了补丁的 dex：在 `com.epicgames.unreal.SplashActivity` 的静态初始化里加 `System.loadLibrary("kmod")`。
4. 开发版：把 `Overlay.java` 编译成 `classes2.dex` 一并加入。
5. `tools/repack.py` 重新打包 APK（不改动其余条目），`zipalign` 对齐，用 `dev.keystore` 签名。

安装：

```bash
adb install -r kards_mod.apk
```

## 开发版与正式版的区别（编译开关）

由 CMake 选项 `KMOD_DEV` 控制：

| | dev | release |
|---|---|---|
| 悬浮控制台与 `classes2.dex` | 包含 | 不包含 |
| 日志级别 | DEBUG+ | INFO+ |
| `kmod/dev/` 热加载核心、覆盖脚本、`console.lua` | 支持 | 忽略 |
| `kmod.debug_crash` | 有 | 无 |

版本号在 `core/src/kmod_version.h`（`KMOD_VERSION`、`KMOD_API_LEVEL`）。

## 改 Lua 部分

`modloader.lua`、`modmanager.lua`、`commands.lua` 在编译时被嵌入核心。开发时不必每次重新编译：把改过的 `modloader.lua` / `modmanager.lua` 放到设备的 `kmod/dev/` 下，开发版会优先使用它们。定稿后再重新构建。

## 已知限制

- 目前只有 Android arm64。Windows 版会复用 Lua 部分，hook 和日志部分需要另写。
- 暂时没有 C++ 模组接口，模组只能用 Lua。
- 游戏版本变化后，SDK 偏移要重新转储；模组可以用 `kards>=` 依赖声明自己适用的游戏版本。
