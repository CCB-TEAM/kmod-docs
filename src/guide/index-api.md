# 模组索引 API

[kmod-index](https://github.com/CCB-TEAM/kmod-index) 把所有公开模组汇总成一个静态 JSON 文件。启动器的「发现」页读的就是它，任何人也可以拿它做网站、机器人或别的客户端。

**只读，不需要账号和密钥。** 它是静态文件，没有查询参数，搜索、筛选、排序都由客户端做。

## 地址

| 用途 | 地址 |
|---|---|
| 索引（官方） | `https://raw.githubusercontent.com/CCB-TEAM/kmod-index/main/index.json` |
| CDN 镜像 | `https://cdn.jsdelivr.net/gh/CCB-TEAM/kmod-index@main/index.json` |
| 国内代理 | `https://gh-proxy.com/` 加上官方地址 |

- 以官方地址为准。镜像和代理由第三方运营，更新更慢，不保证可用；jsDelivr 的缓存最长可达约 12 小时（浏览器侧更久）。
- 官方地址缓存约 5 分钟，支持 `ETag`：带 `If-None-Match` 请求，没有变化时返回 `304`。
- 返回的 `Content-Type` 是 `text/plain`，按 JSON 解析即可。编码 UTF-8。
- 索引和图片带 `Access-Control-Allow-Origin: *`，网页可以直接读取。**模组包（GitHub Release 附件）没有跨域头**，网页脚本读不到它的内容，只能放下载链接。

```bash
curl -s https://raw.githubusercontent.com/CCB-TEAM/kmod-index/main/index.json
```

## 更新频率

GitHub Actions 大约每 3 小时生成一次（定时任务可能延迟）。内容没有变化时文件不会重写。

## 格式

```json
{
  "schema": 1,
  "generated": "2026-11-26T09:56:56Z",
  "blocked": [],
  "mods": [
    {
      "id": "card_art",
      "name": "Card Art Switcher",
      "author": "CCB-TEAM",
      "description": "Switch card art on the card detail page; ...",
      "icon": "icons/card_art.png",
      "cover": "covers/card_art.jpg",
      "repo": "https://github.com/CCB-TEAM/kmod-card-art",
      "stars": 0,
      "downloads": 25,
      "updated": "2026-11-26",
      "verified": false,
      "versions": [
        {
          "version": "0.2.1",
          "url": "https://github.com/CCB-TEAM/kmod-card-art/releases/download/v0.2.1/card_art-0.2.1.kmod",
          "sha256": "089596ce43e8b8cc5104521bbb4d144574bee9ae23263a944b618f22b43dd579",
          "size": 111591,
          "published": "2026-11-26",
          "platforms": ["Android", "Windows"],
          "native": false,
          "paks": false,
          "downloads": 20,
          "permissions": [],
          "depends": ["kmod>=0.4.0", "kards>=1.61"]
        }
      ]
    }
  ]
}
```

### 顶层

| 字段 | 类型 | 说明 |
|---|---|---|
| `schema` | 整数 | 格式版本，目前是 `1` |
| `generated` | 字符串 | 文件内容最后一次变化的时间（UTC，ISO 8601），不是最后一次检查的时间 |
| `blocked` | 字符串数组 | 被维护者按 id 下架的模组。客户端应当提醒已经安装它们的用户 |
| `mods` | 数组 | 模组，按 `id` 排序 |

### 模组

| 字段 | 类型 | 一定有 | 说明 |
|---|---|---|---|
| `id` | 字符串 | 是 | `^[a-z0-9_]+$`，在一个索引内唯一 |
| `name` | 字符串 | 是 | 取自最新版本的 `mod.json`；没写时等于 `id` |
| `author` | 字符串 | 是 | 作者自己填的，可能为空，**未经核实** |
| `description` | 字符串 | 是 | 可能为空。纯文本 |
| `icon` | 字符串 | 否 | 图标地址，建议正方形 |
| `cover` | 字符串 | 否 | 预览图地址，建议约 20:9 |
| `repo` | 字符串 | 是 | 模组仓库网页地址（本地生成的索引里为空） |
| `stars` | 整数 | 是 | 仓库星标数，生成时的值 |
| `downloads` | 整数 | 否 | 该仓库所有 Release 里 `.kmod` 附件的下载次数之和（包括没有列出的旧版本）。本地生成的索引没有这个字段 |
| `updated` | 字符串 | 是 | 最新版本的发布日期 `YYYY-MM-DD` |
| `verified` | 布尔 | 是 | 维护者是否标记为已验证。**不代表绝对安全** |
| `versions` | 数组 | 是 | 至少一个，最多 5 个，新的在前（GitHub 发布列表的顺序） |

### 版本

| 字段 | 类型 | 说明 |
|---|---|---|
| `version` | 字符串 | `mod.json` 里的版本号 |
| `url` | 字符串 | `.kmod` 下载地址 |
| `sha256` | 字符串 | 生成索引时文件的 SHA-256，64 位十六进制 |
| `size` | 整数 | 字节数 |
| `downloads` | 整数 | 这个版本附件的下载次数（GitHub 的计数，扣掉索引生成器自己下载的那一次）。可能缺省 |
| `published` | 字符串 | 发布日期 `YYYY-MM-DD` |
| `platforms` | 字符串数组 | `"Android"`、`"Windows"` |
| `native` | 布尔 | 含 C++ 原生代码 |
| `paks` | 布尔 | 包里带有 [Pak 文件](../mod-format/paks.md)，安装后进入常规 pak 目录 |
| `permissions` | 字符串数组 | 声明的权限，如 `"network"`、`"game_network"` |
| `depends` | 字符串数组 | 依赖条件，如 `"kmod>=0.4.0"`、`"kards>=1.61"`，也可能是别的模组 id |

预发布（pre-release）的 Release 也会收录，草稿不会。

## 客户端应当怎么处理

1. **检查 `schema`**。不认识的版本就停止解析并提示更新。
2. **忽略不认识的字段**。
3. **相对地址**：`icon`、`cover`、`url` 可能是相对路径，按索引文件所在目录解析。带 `..` 或以 `/` 开头的丢弃。
4. **只接受 `https`** 地址。
5. **下载后校验** `size` 和 `sha256`，不一致就丢弃。再确认包里 `mod.json` 的 `id` 和索引一致。
6. **兼容性**：`platforms` 包含当前平台，且 `depends` 里的 `kmod`、`kards` 条件满足（按条件写出的位数比较，`kards>=1.61` 匹配 `1.61.27596`）。取第一个兼容的版本。
7. **原生模组**：`native` 为 `true` 时，安装和更新前明确警告用户。
8. **Pak**：`paks` 为 `true` 时按[安装规则](../mod-format/paks.md)处理：核对包内声明的哈希，覆盖或删除已有 pak 之前询问用户。
9. **下架**：过滤掉 `blocked` 里的 id。
10. 用多个索引时，按 id 合并，排在前面的索引优先。

> [!WARNING]
> 收录是自动的，没有人工审核。`sha256` 只能保证你下载到的文件和**生成索引时**一致：如果作者替换了 Release 里的文件，下一次生成会记录新的哈希。它不能证明模组是安全的。

## 版本约定

- 增加字段不改变 `schema`。
- 删除字段、改变字段含义或类型时，`schema` 加 1，并在[更新日志](../changelog.md)里写明。

## 使用须知

- 请缓存结果，不要频繁轮询：每小时一次绰绰有余。
- 模组的名称、说明、图片和包文件归各自作者所有，转载请遵守模组仓库的许可证。
- 图片是第三方内容，展示时按纯图片处理；名称和说明按纯文本处理，不要当作 HTML 插入页面。

## 示例

列出所有能在 Android 上用的模组和最新版本：

```python
import json, urllib.parse, urllib.request

URL = "https://raw.githubusercontent.com/CCB-TEAM/kmod-index/main/index.json"
index = json.load(urllib.request.urlopen(URL))
assert index["schema"] == 1
for mod in index["mods"]:
    if mod["id"] in index["blocked"]:
        continue
    for v in mod["versions"]:
        if "Android" in v["platforms"]:
            print(mod["id"], v["version"], urllib.parse.urljoin(URL, v["url"]))
            break
```

```javascript
const URL_ = "https://raw.githubusercontent.com/CCB-TEAM/kmod-index/main/index.json";
const index = await (await fetch(URL_)).json();
const mods = index.mods.map((m) => ({ ...m, icon: m.icon && new URL(m.icon, URL_).href }));
```

## 自己搭一个索引

任何能提供 HTTPS 静态文件的地方都可以。用 kmod-index 仓库里的生成器：

```bash
python build_index.py --local 放着kmod文件的文件夹 --out dist
```

把 `dist/` 整个传上去，在启动器「设置 → 模组索引地址」里填 `index.json` 的地址。想让模组进官方索引，见[发布模组](publishing.md)。
