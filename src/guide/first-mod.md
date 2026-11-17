
# 第一个模组

在 `kmod/mods/hello/` 下建两个文件。

`mod.json`：

```json
{
  "format": 1,
  "id": "hello",
  "name": "Hello",
  "version": "1.0.0",
  "depends": ["kmod>=0.2.0", "kards>=1.61"]
}
```

`main.lua`：

```lua
Log.info("hello from " .. Mod.id .. " v" .. Mod.version)

-- 每次玩家控制器重启（进入新场景）时打印一行
RegisterHook("/Script/Engine.PlayerController:ClientRestart", function(self, params)
  Log.info("controller restarted: " .. self:GetName())
end)
```

> [!IMPORTANT]
> **未验证**
>
> 这里的 `ClientRestart` 钩子是示意，没有在手机上运行过。想先确认环境，只留第一行 `Log.info` 即可。

然后：

1. 编辑 `kmod/state.json`，把 `"hello"` 加进 `enabled`；或者打开游戏设置页的 **Mods** 标签，勾选启用。
2. 看 `kmod/logs/kmod.log`，应能看到 `I/hello: hello from hello v1.0.0`。
3. 改了脚本后，进 Mods 页会重新加载；也可以重启游戏。开发版还可以在[控制台](../console/index.md)里输入 `reload`。

## 下一步

- 给模组加设置项：[设置项](../mod-format/settings.md)。
- 理解钩子什么时候触发：[钩子](../concepts/hooks.md)。
- 看更多代码：[示例](../guides/examples.md)。
