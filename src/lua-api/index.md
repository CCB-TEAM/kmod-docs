
# Lua API

模组脚本运行在 Lua 5.4 里，在[游戏线程](../concepts/game-thread.md)上执行（[`Worker`](global-functions/worker.md) 的脚本除外，它在自己的线程里）。每个模组有独立的环境：全局变量互不干扰，但都能读到标准库和下面列出的全局函数。

> [!NOTE]
> 本章的接口属于接口级别 1，Android 版和 Windows 版通用（只有一端支持的会在页面里写明）。每个页面里标成"未验证"的内容是按代码写的，没有在手机上跑过。

| 章节 | 内容 |
|---|---|
| [模组环境](mod-env/index.md) | 每个模组都有的表：`Mod`、`Log`、`Settings`、`Lang`、`Console`、`require`、`kmod` |
| [全局函数](global-functions/index.md) | 查找对象、加载资源、钩子、定时器 |
| [类](classes/index.md) | `UObject` 包装的方法，钩子的 `params` |
