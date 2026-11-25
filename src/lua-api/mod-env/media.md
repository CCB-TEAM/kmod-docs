# Media

让玩家从手机相册（电脑上是文件对话框）里选一张图片，保存到模组指定的位置。不需要任何权限声明：每次都由玩家自己选。

```lua
Media.pick_image(Mod.data_dir .. "/avatar", function(path, err)
  if not path then
    if err ~= "cancelled" then Log.warn("导入失败：" .. err) end
    return
  end
  Log.info("图片已保存到 " .. path)
end)
```

| 函数 | 说明 |
|---|---|
| `Media.pick_image(dest, cb)` | 打开图片选择器。选好后保存到 `dest` 加扩展名，然后在游戏线程调用 `cb(path)`。没有选（取消）时 `cb(nil, "cancelled")`，出错时 `cb(nil, 错误信息)`。返回 `true` 表示选择器已打开，`false` 表示这个平台打不开 |

| `Media.pick_file(dest, exts, cb)` | 选任意文件。`exts` 是允许的扩展名，用逗号隔开（如 `"artpack,zip"`）。选好后原样复制到 `dest` 加 `.` 和扩展名，然后 `cb(path, 原文件名)`；取消时 `cb(nil, "cancelled")` |
| `Media.save_file(src, name, cb)` | 「另存为」：让玩家选保存位置和文件名（建议名是 `name`），把 `src` 复制过去，然后 `cb(玩家选的名字)`。取消时 `cb(nil, "cancelled")`。`src` 必须在允许的目录里 |
| `Media.zip(srcDir, destZip)` | 把一个文件夹打成不压缩的 zip，同步完成。返回 `true`，或 `false` 加错误信息。两个路径都必须在允许的目录里 |

## 目标路径

`dest` 不带扩展名；`Media.save_file` 的 `src`、`Media.zip` 的两个路径也一样。它们必须在 `kmod/art/` 或本模组自己的数据目录（`kmod/data/<模组id>/`）里，路径里不能有 `..`。目录会自动创建。

## 平台差别

| | Android | Windows |
|---|---|---|
| 选择器 | 系统的图片选择器（相册、相机胶卷、文件管理器都在里面） | 文件对话框 |
| 保存的格式 | 一律转成 **PNG**，最长边超过 2048 像素时缩小 | 原文件原样复制，扩展名是 `.png`、`.jpg` 或 `.bmp` |
| 返回的路径 | `dest.png` | `dest.<原扩展名>` |

## 说明

- 旧版本的加载器没有 `Media`：先检查 `Media ~= nil` 再用。
- 选择器是异步的：游戏不会卡住，回调在玩家选完之后才调用。选择过程中如果模组被重新加载或停用，回调不会再调用。
- 图片大小不限制，但很大的图片会拖慢保存。需要小图的话自己缩小后再用。
