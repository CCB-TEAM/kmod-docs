
# Console.register

模组环境里有 `Console` 表，用来注册自己的指令。

```lua
Console.register("greet", function(args, ctx)
  local who = args[1] or "world"
  return "hello " .. who          -- 返回字符串会被打印
end, { help = "say hello", usage = "greet [name]" })
```

## Console.register(name, handler, info)

- `name`：小写字母开头，只能含小写字母、数字、`_`、`-`、`.`。
- `handler(args, ctx)`：
  - `args` 是参数数组（字符串）。
  - `ctx.line` 是不含 `/` 前缀的原始整行，`ctx.print(...)` 把内容打印到控制台。
  - 返回字符串则打印；返回 `nil` 什么都不打印。
  - 抛出错误时，控制台显示 `[error] 名字: 原因`，同时在日志里留一条警告。指令出错**不计入**模组的自动禁用错误数。
- `info`：一个字符串（作为说明），或 `{ help = "...", usage = "..." }`。
- 返回 `true`；失败返回 `false, 原因`，同时写一条警告到日志。失败的情形：名字不合法、`handler` 不是函数、名字已被内置指令或其他模组占用。同一个模组可以重复注册同名指令来覆盖自己的。

指令不会自动带模组前缀；想避免冲突，建议用 `模组id.指令名` 或 `模组id-指令名` 的形式。

## 其他接口

| 函数 | 说明 |
|---|---|
| `Console.unregister(name)` | 取消自己注册的指令，成功返回 `true` |
| `Console.exec(line)` | 像在控制台里输入一样执行一行，返回是否被当作指令处理 |
| `Console.print(...)` | 打印到控制台 |

模组被禁用或重新加载时，它注册的指令会自动撤销。

## 示例：一个管理指令

```lua
Console.register("mymod.scale", function(args)
  if not args[1] then return "scale = " .. Settings.get("scale") end
  local v = tonumber(args[1])
  if not v then return "expected a number" end
  Settings.set("scale", v)
  return "scale set to " .. v
end, { help = "show or set the scale", usage = "mymod.scale [value]" })
```

输入 `mymod.scale 1.5` 即可修改。
