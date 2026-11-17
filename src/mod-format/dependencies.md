
# 依赖与版本条件

```json
"depends": ["kmod>=0.2.0", "kards>=1.61", "hello_mod>=1.0.0,<2.0.0", "util_mod"]
```

每个元素是 `id` 加可选的版本条件：

- 运算符：`>=` `>` `<=` `<` `=`（`==` 同义）。多个条件用逗号分隔，须全部满足；不写条件表示任意版本。
- 版本按 `x.y.z` 三段数字逐段比较，缺省的段补 0（`1.101` 大于 `1.61`，不是按小数比）。后缀（如 `-beta`）不识别，会被忽略。
- 先加载依赖，再加载模组本身；依赖不存在、未启用或有错误，则本模组不加载。

## 保留 id

| id | 含义 | 版本取值 |
|---|---|---|
| `kmod` | 加载器本身 | `kmod.version`（如 `0.3.0`） |
| `kards` | 游戏本体 | 游戏版本号 `x.xx.xxxx` 只取第二个点之前，如 `1.61`、`1.101`（`kmod.game`） |

保留 id 不需要安装，也不参与加载顺序。

游戏版本取自 `GeneralProjectSettings.ProjectVersion`（形如 `Kards 1.61.27596.APK`）。读不到时，`kards` 的条件会被忽略并在日志里写一条警告，模组照常加载。

## 不满足时

模组不加载，Mods 页和日志里显示原因：

| 情形 | 状态文字 |
|---|---|
| 加载器或游戏版本不符 | `requires kmod>=9.0.0 (have 0.3.0)`、`requires kards>=1.101 (have 1.61)` |
| 依赖的模组版本不符 | `dependency version: hello_mod>=2.0.0 required (have 1.0.0)` |
| 依赖缺失 / 未启用 / 有错误 | `missing dependency: <id>` |
| 依赖自己加载失败 | `dependency failed: <id>` |
| 循环依赖 | `dependency cycle` |
| 写法错误（如 `"kmod>>1"`） | `bad dependency ...`，视为模组错误 |

`.kmod` 安装时同样检查 `kmod` / `kards` 的条件和写法，不通过的包移到 `inbox/failed/`，旁边的 `.txt` 写明原因。

## 在脚本里比较版本

```lua
kmod.version_satisfies("1.101", ">=1.61")   --> true
kmod.version_satisfies("1.61", ">=1.101")   --> false
```
