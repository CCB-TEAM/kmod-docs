
# 注入工具（`tools/kmod_inject.py`）

给一个 KARDS 的 APK 检查能不能注入 kmod loader，能的话直接生成注入后、已签名的 APK。它不认具体游戏版本：启动类、引擎库、要打补丁的 dex 都是从 APK 里读出来的。

## 用法

```bash
python tools/kmod_inject.py check  kards.apk
python tools/kmod_inject.py inject kards.apk --out kards_kmod.apk \
    --loader libkmod.so --core libkmodcore.so [--md7 libkmodmd7.so] [--ks my.keystore --ks-alias kmod --ks-pass android]
```

- `check` 只检查，不写任何文件，退出码 0 表示可以注入。加 `--json` 输出机器可读的报告。
- `inject` 也先检查，通过才继续。`--dry-run` 只检查。
- 没给 `--ks` 时，在输出文件旁边生成一把 `kmod-injected.keystore`。**请保管好它**：以后用别的密钥签的版本不能覆盖安装在这一个上。
- 需要 Python 3.8+、JDK、Android build-tools（`zipalign`、`apksigner`），以及用来改 dex 的 `tools/DexTool`：先运行 `tools/build_dextool.ps1` 编译一次（用 Android Studio 里的 smali dexlib2 库，位置可用 `ANDROID_STUDIO` 环境变量或 `--dextool-cp` 指定）。

## 检查什么

读 `AndroidManifest.xml`（二进制 XML）和 APK 里的库：

| 检查 | 结果 |
|---|---|
| 是完整 APK（有清单和 `classes.dex`） | 不是（比如分包、`.xapk`）就拒绝，要先解开 |
| `lib/arm64-v8a/` 里有虚幻引擎库（`libUnreal.so`、`libUE4.so`） | 没有就拒绝 |
| 引擎版本 | 从库里的版本字符串读出，读不到只警告 |
| 启动类 | 清单里带 `MAIN`/`LAUNCHER` 过滤器的 Activity（别名会解析到它的目标）；没有就用 `Application` 类。找不到类所在的 dex 就拒绝 |
| 是否已经注入过 | 警告 |
| 防篡改 | 有 Google PairIP（`libpairipcore.so`）或 Play 授权库就警告：重新签名的包可能拒绝运行 |
| `targetSdkVersion` 太旧 | 警告：Android 14 以后拒绝安装低于 23 的应用 |

## 注入做什么

1. 在启动类的静态初始化最前面加一行 `System.loadLibrary("kmod")`（改的是包含这个类的那个 dex）。
2. 把 `libkmod.so`、`libkmodcore.so`（可选 `libkmodmd7.so`）放进 `lib/arm64-v8a/`。清单里 `extractNativeLibs` 为 false 时不压缩存放。
3. 去掉原来的签名，用 `zipalign -p` 对齐，再用 `apksigner` 签名。

我在 KARDS 的 APK 上验证过：从清单读出的启动类就是 `com.epicgames.unreal.SplashActivity`，生成的 `classes.dex` 和之前手写脚本生成的字节完全一致，`apksigner verify` 通过，`zipalign` 检查通过。

## 限制

- 重新签名后，签名和原版不同，**必须先卸载原版**才能安装，原版的应用私有数据会丢。
- 带 PairIP 这类完整性保护的游戏，注入后很可能无法运行；工具只能提前警告。
- 只改一个启动类。如果这个类的静态初始化里有 `try` 块，补丁会失败（报错而不是写坏文件）。
