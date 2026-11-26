# 模组包里的 Pak

`.kmod` 可以带上 [Pak 模组](../guide/pak-mods.md)。安装时它们被放进常规的 pak 目录，之后和手动放进去的 pak 一样启用、停用、删除。需要加载器 0.4.0 和启动器 1.0.0。

```
my_skin.kmod
├── mod.json
├── main.lua              # 可选：只带 pak 的包可以没有
└── paks/
    ├── windows/MySkin_P.pak
    └── android/MySkin_P.pak
```

```json
{
  "format": 2,
  "id": "my_skin",
  "version": "1.0.0",
  "depends": ["kmod>=0.4.0"],
  "paks": [
    { "file": "paks/windows/MySkin_P.pak", "sha256": "（64 位十六进制）", "platforms": ["Windows"] },
    { "file": "paks/android/MySkin_P.pak", "sha256": "（64 位十六进制）", "platforms": ["Android"] }
  ]
}
```

## 声明规则

pak 文件没有版本号，所以靠哈希识别内容。违反下面任何一条，整个包都不会安装。

- `paks/` 下的**每个文件**都要在 `paks` 里声明，声明的文件也必须在包里。
- `sha256` 是该文件内容的 SHA-256，安装时核对。
- 文件类型只能是 `.pak`、`.utoc`、`.ucas`、`.sig`，后三种旁边必须有同名的 `.pak`。
- 安装后的文件名是路径的最后一段；同一平台不能有两个同名文件。不能与游戏本体的包重名（`kards-Windows*`、`pakchunk*` 等）。
- `platforms` 省略表示所有平台。两个平台烘焙出的资源一般不通用。
- 必须写 `"depends": ["kmod>=0.4.0"]`（或更高），否则旧版加载器会装上 Lua 部分、漏掉 pak。
- 单个 pak 文件不超过 512 MB，整个包不超过 1 GB；`paks/` 以外的内容仍是单文件 32 MB、总计 128 MB。

计算哈希（PowerShell）：

```powershell
(Get-FileHash paks\windows\MySkin_P.pak -Algorithm SHA256).Hash.ToLower()
```

## 安装、更新、删除

| 情况 | 行为 |
|---|---|
| 首次安装，没有同名文件 | 直接装好 |
| 已有同名文件，内容相同 | 直接认领 |
| 已有同名文件，内容不同 | 先询问，同意后覆盖 |
| 更新，pak 有变化 | 先询问；同意后**直接覆盖**旧文件（不备份），删除新版本不再包含的文件 |
| 更新，pak 哈希都没变 | 不询问，也不改动 pak（你手动删掉的 pak 不会被放回去） |
| 被停用的 pak 遇到更新 | 保持停用 |

- **启动器**：改动 pak 时游戏必须关闭。删除模组时会询问是否一起删除它的 pak（默认删除），保留下来的作为普通 pak 模组。
- **游戏内**（手动把 `.kmod` 放进 `kmod/mods`）：首次安装直接部署。需要询问时，旧版本照常运行，Mods 页出现"Pak 更新待确认"，点"安装"后新文件先放进 `kmod/pak-staged`，**下次启动游戏时**替换。控制台等价命令：`paks confirm`、`paks confirm <文件名.kmod>`。
- 生效时机：Windows 上装好的 pak 要重启游戏才加载；Android 上首次安装的 pak 会立即挂载，更新要重启。

归属关系记录在 `kmod/pak-owners.json`。以文件夹形式放入的模组不会部署 pak，请打包成 `.kmod`。
