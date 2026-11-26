# 写模组：概览

模组是 Lua 脚本（也可以带 C++ 原生库或 Pak 文件），由加载器在游戏线程里运行。

1. [安装加载器](launcher.md)。写模组建议用**开发版**，有控制台和更详细的日志。
2. [写第一个模组](first-mod.md)。
3. [打包成 .kmod](packaging.md)。
4. [发布模组](publishing.md)，让别人在启动器里搜到它。

写之前值得读一下[游戏线程](../concepts/game-thread.md)和[对象与有效性](../concepts/object-validity.md)。查接口见 [Lua API](../lua-api/index.md)。
