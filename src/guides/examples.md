
# 示例

下面的例子只用文档里已经验证过的接口。

## 读设置并响应变化

`mod.json`：

```json
{"format":1,"id":"demo","name":"Demo","version":"1.0.0",
 "settings":[{"id":"loud","type":"bool","label":"Loud","default":false}]}
```

`main.lua`：

```lua
local loud = Settings.get("loud")
Log.info("loud = " .. tostring(loud))
Settings.on_change(function(id, value)
  if id == "loud" then loud = value end
end)
```

## 定时任务

```lua
local n = 0
LoopAsync(1000, function()
  n = n + 1
  Log.info("tick " .. n)
  return n >= 5          -- 五次后停止
end)
```

## 列出某个类的所有对象

```lua
for i, w in ipairs(FindAllOf("WBP_NUI_MasterCheckbox_C") or {}) do
  Log.info(i .. ": " .. w:GetPathName())
end
```

## 加载 pak 里的资源

```lua
local cls, err = LoadAsset("/Game/Blueprints/CrossPlatformUI/NUI_Widgets/WBP_NUI_MasterSlider.WBP_NUI_MasterSlider_C")
if cls then
  Log.info("loaded " .. cls:GetPathName())
else
  Log.warn("load failed: " .. tostring(err))
end
```

## 注册一个控制台指令

```lua
Console.register("demo.hello", function(args)
  return "hello " .. (args[1] or "world")
end, { help = "say hello", usage = "demo.hello [name]" })
```

## 依赖另一个模组

`mod.json`：

```json
{"format":1,"id":"demo_ext","name":"Demo Ext","version":"1.0.0",
 "depends":["kmod>=0.2.0","kards>=1.61","demo>=1.0.0,<2.0.0"]}
```

`demo_ext` 会在 `demo` 加载之后加载；`demo` 的版本不在范围内时，`demo_ext` 不加载，状态里写明原因。
