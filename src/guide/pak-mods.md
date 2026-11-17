
# Pak 模组

把 `.pak` 文件放进手机上的 `kmod/paks/` 文件夹，游戏启动后 kmod 会自动把它们挂载到引擎里，不需要改游戏的 `Paks` 目录。

```
/sdcard/Android/media/com.android1939.kardsapk/kmod/paks/
```

## 工作方式

- 游戏引擎就绪后（启动约 10 秒内、早于模组脚本加载），`kmod/paks/` 里的每个 `.pak` 按文件名排序挂载，每次游戏运行只挂载一次。挂载由核心直接完成，不依赖任何模组。
- 优先级：kmod 把这些 pak 的 order 设成 100 起（按排序递增），**高于游戏自带的 pak**，所以它们能替换游戏里同路径的资源。文件名排在后面的 pak 优先级更高。
- 挂载发生在游戏已经开始加载资源之后（引擎就绪时）。挂载前已经加载进内存的资源不会被换掉，比如启动画面。
- 只读取，不改动 pak 文件。
- 删除或替换 pak 之后需要**重启游戏**才生效，kmod 不会卸载已挂载的 pak。

## 控制台

```
paks              列出 kmod/paks 里的 pak 和状态（mounted / failed / switched off / skipped ...）
paks off <文件>   关掉某个 pak：下次启动起不再挂载（已经挂载的要重启才会消失）
paks on <文件>    重新打开
```

Lua 里 `kmod.mount_pak(路径)` 可以直接挂载一个 pak（返回是否成功），`kmod.pak_status()` 返回状态列表，`kmod.pak_off(文件名, true/false)` 开关某个 pak。一般不需要。

## 崩溃时

挂载某个 pak 时游戏崩溃，下次启动该 pak 会被**隔离**（状态 `skipped (it crashed the game)`）；进入[安全模式](safe-mode.md)时所有 pak 都不挂载。用 `unquarantine pak <文件名>` 解除。

## 限制

- 引擎里的挂载函数是运行时识别的（见[版本支持](../concepts/version-support.md)），不是写死的偏移。识别不了（游戏改动较大）时，核心写警告并跳过挂载。目前只在 KARDS 1.61.27596 上验证过。
- 包含新资源的 pak（新卡牌等）自带完整的 `AssetRegistry.bin`，多个这样的 pak 同时挂载，只有一个的新资源能被游戏发现。只替换已有资源的 pak（例如换卡图）没有这个问题。
- 两个 pak 替换同一个资源时，只有优先级高的那个生效。需要在多套卡图之间切换，请用 [card_art 示例模组](https://github.com/CCB-TEAM/KMod-Loader-Android/tree/main/examples/card_art)，它在运行时用 PNG 变体切换。
- 如果同时挂载了换卡图的 pak 和 `card_art`，`card_art` 眼里的"原图"就是 pak 里的图。它仍然能工作，但按钮里的选项会和 pak 的图重复。
