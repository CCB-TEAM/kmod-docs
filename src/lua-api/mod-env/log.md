
# Log

```lua
Log.debug("...")   -- 仅开发版写入文件
Log.info("...")
Log.warn("...")
Log.error("...")
```

参数可以是任意值，会用制表符连接。日志写到 `kmod/logs/kmod.log`，行首标签是模组 id，格式见[调试与日志](../../guides/debugging.md)。`print(...)` 等价于 `Log.info(...)`。
