
# 从 UE4SS 迁移

kmod 的 Lua API 沿用了 UE4SS 的大部分名字，所以简单的脚本改几处就能跑。下面列出已知的差异。

> [!NOTE]
> 这里只比较两边都确实存在的接口。UE4SS 的接口很多，没有列出的不代表 kmod 支持。

## 一致或几乎一致

| 名字 | 说明 |
|---|---|
| `FindFirstOf`、`FindAllOf`、`FindObject`、`StaticFindObject` | 用法相同。`FindAllOf` 找不到时返回 `nil` |
| `RegisterHook`、`UnregisterHook` | 回调的参数不同，见下 |
| `ExecuteWithDelay`、`ExecuteInGameThread`、`LoopAsync`、`NotifyOnNewObject` | 用法相同，`LoopAsync` 返回 `true` 停止 |
| `obj:IsValid()`、`GetName()`、`GetFullName()`、`GetClass()`、`GetOuter()` | 用法相同；kmod 的 `GetName` / `GetFullName` 不含包路径，另有 `GetPathName()` |
| `obj.Property`、`obj.Property = x`、`obj:Function(...)` | 用法相同 |

## 不同的地方

| UE4SS | kmod |
|---|---|
| 钩子回调 `function(Context, Param1, ...)`，参数都是 `RemoteUnrealParam`，要 `:get()` 取值 | 钩子回调 `function(self, params)`：`self` 直接是 `UObject`，`params.参数名` 直接是值，**不需要 `:get()`** |
| 钩子回调的返回值可以改写函数返回值 | 返回值被忽略 |
| `RegisterHook` 的前置 / 后置回调含义取决于路径是否以 `/Script/` 开头 | 第 2 个参数总是前置，第 3 个总是后置 |
| `FindFirstOf` 找不到返回无效对象 | 相同（返回无效对象，不是 `nil`） |
| `RegisterConsoleCommandHandler` 等 | 用 [`Console.register`](../console/register.md) |
| `Scripts/main.lua` + `enabled.txt` | 新格式 `main.lua` + `mod.json`，加载器会自动兼容并迁移旧布局，见[模组包格式](../mod-format/index.md) |
| 按键绑定（`RegisterKeyBind`）等 | kmod 目前没有，手机上也没有键盘 |
| 全局的 `print` 输出到 UE4SS 的日志 | `print` 等价于 `Log.info`，带模组 id 标签 |

## 差别最大的几点

- **没有 `:get()`**：把 `Context:get()` 改成 `self`，`NewPawn:get()` 改成 `params.NewPawn`。
- **模组结构**：kmod 要求有 `mod.json`（至少 `format`、`id`、`version`），没有会警告并用文件夹名当 id。
- **kmod 没有的 UE4SS 功能**：C++ 模组，一键转储（`DumpAllObjects`、`DumpUSMAP`、`GenerateSDK` 等），`FindObjects`、`ForEachUObject`、`StaticConstructObject`，各种 `Register*PreHook` / `PostHook`，`RegisterKeyBind`，`RegisterConsoleCommandHandler`（对应的是 `Console.register`）。查游戏数据的办法见[控制台指令](../console/index.md)。
- **`LoadAsset`**：两边都有同名函数，参数都是资源路径。kmod 的会返回加载到的对象（失败返回 `nil` 和原因），见 [`LoadAsset`](../lua-api/global-functions/loadasset.md)。
