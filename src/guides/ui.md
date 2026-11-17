
# 做界面

Mods 页本身就是用这套 API 实现的（源码：`core/lua/modmanager.lua`）。做自己的界面时的要点：

- 用游戏自带的 `WBP_NUI_*` 控件（`WBP_NUI_MasterCheckbox_C`、`MasterSlider_C`、`MasterDropdown_C`、`MasterTextBlock_C` 等），朴素的 UMG 默认控件不会渲染。
- 加到屏幕用 `AddToViewport`，不要用 `AddToPlayerScreen`；文字要在 `AddChild` 之后再 `SetText`。
- 设置页的一行用游戏的 `W_OptionsEntryBase_C`（`OptionNameText` 是标签，`ContentSlot` 放控件）。文本输入用 `W_EditableTextBox_C`。
- 调试界面可用 `kmod.print_tree(widget, 深度)` 打印控件树。

> [!WARNING]
> **不要**实例化游戏的整页（如 `W_OptionsSettings_C`）来克隆：它们会把原页面的内容槽（NamedSlot）里的控件抢走，原界面就会缺东西。只读取样式（字体、颜色、间距、缩放），自己搭一个新页面。

## 跟随游戏的 UI 缩放

游戏的设置页把内容放在一个 `ScaleBox` 里，缩放选项改的是它的 `UserSpecifiedScale`。自己的页面可以读这个值并设置到自己的 `ScaleBox` 上，界面大小就会随游戏的 UI 比例选项变化。
