# 发布模组

把模组发布出来，让别人在 [KMod Launcher](launcher.md) 的「发现」页里下载。不需要提交申请。

1. 把模组放在一个公开的 GitHub 仓库里。
2. 给仓库加上主题（topic）`kmod-mod`。
3. 把模组打包成 [`.kmod`](packaging.md)，发一个 Release，附上这个文件。
4. 索引每 3 小时生成一次，之后模组就会出现。

## 显示内容

全部来自包里的 `mod.json` 和图片，见[模组包格式](../mod-format/index.md)：

- `name`、`author`、`description`、`version`、`platform`、`depends`、`permissions`、`native`、`paks`；
- `icon.png`（正方形图标）和 `cover.png`（横幅预览图，约 20:9），也可以用 `icon`、`cover` 字段指定别的相对路径；都是可选的，单个不超过 512 KB。

用 `depends` 写清需要的版本（如 `kmod>=0.4.0`），不兼容的模组默认不会显示给用户。

## 更新版本

改 `mod.json` 的 `version`，发新的 Release。每个模组保留最近 5 个版本。不要替换已经发布的文件：索引下一次生成之前，启动器会因为 SHA-256 不一致而拒绝安装。索引的格式见[模组索引 API](index-api.md)。

自动打包的例子见 [kmod-card-art](https://github.com/CCB-TEAM/kmod-card-art) 的 `.github/workflows/release.yml`。

## 规则

- 同一个 `id` 被多个仓库使用时，创建时间最早的仓库保留它。
- 维护者可以把有问题的模组加入黑名单；已经安装它的用户会在启动器里看到提示。
