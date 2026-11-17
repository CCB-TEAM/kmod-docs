
# Worker

```lua
local w = Worker("worker.lua")
```

在**独立线程**里运行 `worker.lua`（路径相对于模组目录）。worker 有自己独立的 Lua 状态，和游戏线程**并行执行**，所以耗时的计算、解析、文件处理不会卡游戏。

worker 和主脚本之间只能通过**消息**交换数据。游戏对象（`UObject`）不能进入 worker：引擎只允许游戏线程访问它们，在别的线程里碰会随机崩溃。

## 游戏线程一侧

| 方法 | 说明 |
|---|---|
| `w:post(msg)` | 发消息给 worker。返回前已完整复制，之后修改 `msg` 不影响 worker |
| `w:onMessage(fn)` | 设置接收 worker 消息的回调 `fn(msg)`，在**游戏线程**执行，可以放心操作游戏对象。返回 `w` |
| `w:alive()` | worker 线程是否还在运行 |
| `w:close()` | 停止 worker。模组被禁用或重新加载时会自动关闭，不必手动调用 |

回调大约每 50 ms 投递一次，每个 worker 每次最多 256 条。

## worker 一侧（worker.lua 里的全局）

| 名称 | 说明 |
|---|---|
| `onMessage(fn)` | 注册 `fn(msg)`，收到主脚本的每条消息时调用。注册后线程会一直等待消息，直到被关闭；不注册则脚本跑完线程就结束 |
| `post(msg)` | 发消息给游戏线程（触发 `w:onMessage` 的回调） |
| `Sleep(ms)` | 等待，关闭 worker 时会提前醒来；被要求停止时返回 `false` |
| `IsStopping()` | worker 是否正在被关闭。长循环里可以检查它 |
| `print(...)` | 写进 kmod 日志，带 `[worker <模组id>]` 前缀 |
| `json.encode(v)` / `json.decode(s)` | 与 `kmod.json` 相同 |
| `fs.read(path)` | 读取 kmod 目录内的文件，失败返回 `nil` |
| `fs.write(path, data)` | 写文件，**只能写在 `kmod/data/` 内**，返回是否成功 |
| `fs.exists(path)` / `fs.list(dir)` | 判断存在、列目录（`{name=, dir=}` 列表），只限 kmod 目录内 |
| `paths.root` | kmod 根目录 |
| 标准库 | `string`、`table`、`math`、`utf8`、`coroutine`，以及只含 `time`/`clock`/`date` 的 `os` |

worker 里**没有**：`io`、`require`、`dofile`、`loadfile`、`os.execute`、`Hook` 一类的游戏 API、`FindFirstOf` 等。

## 能发送什么

`nil`、`boolean`、`number`、`string`，以及由它们组成的 `table`（键只能是字符串、数字、布尔值）。函数、userdata、游戏对象不能发送，`post` 会抛错。嵌套最多 32 层，所以包含自己的表也会被拒绝。

队列最多 20000 条，满了 `post` 抛错，这是为了避免一方发得太快把内存撑满。

## 错误与停止

- worker 里的脚本出错，错误写进日志并**计入模组的错误数**（和钩子出错一样，累计 10 次自动停用模组）。出错后线程结束。
- 一个死循环的 worker 也能被关闭：Lua 每执行几千条指令会检查停止标记。关闭最多等 2 秒，之后线程被放弃，不会拖住游戏。
- 每个游戏同时最多 16 个 worker。

## 示例

`main.lua`：

```lua
local w = Worker("worker.lua")
w:onMessage(function(m)
  Log.info("素数个数：" .. m.count)
end)
w:post({ cmd = "primes", n = 3000000 })     -- 不会卡游戏
```

`worker.lua`：

```lua
onMessage(function(m)
  if m.cmd == "primes" then
    local count, sieve = 0, {}
    for i = 2, m.n do
      if not sieve[i] then
        count = count + 1
        for j = i * 2, m.n, i do sieve[j] = true end
      end
    end
    post({ count = count })
  end
end)
```

## 什么时候用

适合：解析大 JSON、扫描目录、批量计算、需要等待的任务。不适合：需要读写游戏对象的事。那类操作在 `onMessage` 回调里（游戏线程）做，例如 worker 算好要改的卡牌列表，回调里再逐个应用。
