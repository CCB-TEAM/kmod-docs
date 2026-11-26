// The table of contents. A new page needs a line here, otherwise it is only reachable through links and search.
const p = (text, link, items) => (items ? { text, link, collapsed: true, items } : { text, link });
const g = (text, items, collapsed) => (collapsed === undefined ? { text, items } : { text, items, collapsed });

/** For players: install, manage mods, fix problems. */
export const guide = [
  g("开始使用", [
    p("KMod Launcher（推荐）", "/guide/launcher"),
    p("安装：Windows", "/guide/installation-windows"),
    p("安装：Android", "/guide/installation"),
    p("安装器（Android）", "/guide/installer"),
  ]),
  g("使用模组", [
    p("Pak 模组", "/guide/pak-mods"),
    p("崩溃保护与安全模式", "/guide/safe-mode"),
  ]),
];

/** For mod authors. */
export const dev = [
  g("入门", [
    p("概览", "/guide/"),
    p("第一个模组", "/guide/first-mod"),
    p("打包成 .kmod", "/guide/packaging"),
    p("发布模组", "/guide/publishing"),
  ]),
  g("指南", [
    p("总览", "/guides/"),
    p("编辑器补全", "/guides/editor-setup"),
    p("调试与日志", "/guides/debugging"),
    p("开发版控制台（Windows）", "/guide/dev-console"),
    p("做界面", "/guides/ui"),
    p("示例", "/guides/examples"),
    p("C++ 模组", "/guide/native-mods"),
    p("从 UE4SS 迁移", "/guides/migrating-from-ue4ss"),
  ]),
  g("模组包格式", [
    p("mod.json", "/mod-format/"),
    p("依赖与版本条件", "/mod-format/dependencies"),
    p("模组包里的 Pak", "/mod-format/paks"),
    p("设置项", "/mod-format/settings"),
    p("本地化", "/mod-format/localization"),
    p("加载流程与状态", "/mod-format/status"),
  ]),
  g("概念", [
    p("总览", "/concepts/"),
    p("游戏线程", "/concepts/game-thread"),
    p("对象与有效性", "/concepts/object-validity"),
    p("钩子", "/concepts/hooks"),
    p("模组生命周期", "/concepts/lifecycle"),
  ]),
  g("加载器内部", [
    p("版本支持", "/concepts/version-support"),
    p("Windows 版是怎么工作的", "/concepts/windows"),
    p("构建加载器", "/guides/building"),
    p("注入工具", "/guide/injector"),
  ], true),
];

const env = (name, file = name.toLowerCase()) => p(name, `/lua-api/mod-env/${file}`);
const fn = (name) => p(name, `/lua-api/global-functions/${name.toLowerCase()}`);

export const api = [
  g("Lua API", [p("总览", "/lua-api/")]),
  g("模组环境", [
    p("总览", "/lua-api/mod-env/"),
    ...["Mod", "Log", "Settings", "Lang", "require", "kmod", "Events", "Store"].map((n) => env(n)),
  ], false),
  g("界面与输入", [env("UI"), env("UI.web（网页界面）", "web"), env("Input"), env("Media")], false),
  g("网络", [env("Http"), env("WebSocket 与 Socket", "sockets"), env("游戏自身的网络", "net")], false),
  g("全局函数", [
    p("总览", "/lua-api/global-functions/"),
    ...["FindFirstOf", "FindAllOf", "FindObject", "StaticFindObject", "CreateInvalidObject", "LoadAsset", "RegisterHook", "UnregisterHook",
      "ExecuteWithDelay", "ExecuteInGameThread", "LoopAsync", "NotifyOnNewObject", "FastLoop", "Worker", "ExecuteAsync"].map(fn),
    p("UE4SS 兼容", "/lua-api/global-functions/ue4ss-compat"),
  ], false),
  g("类", [p("总览", "/lua-api/classes/"), p("UObject", "/lua-api/classes/uobject"), p("Params", "/lua-api/classes/params")], false),
  g("控制台指令", [p("总览", "/console/"), p("内置指令", "/console/builtin"), p("Console.register", "/console/register")], false),
  g("模组索引", [p("模组索引 API", "/guide/index-api")], false),
];

/** One sidebar per section, keyed by page: the sections share the guide/ folder, so a folder prefix is not enough. */
export function sidebar() {
  const out = {};
  const add = (groups) => {
    const walk = (items) => items.forEach((i) => {
      if (i.link) out[i.link] = groups;
      if (i.items) walk(i.items);
    });
    walk(groups);
  };
  [guide, dev, api].forEach(add);
  return out;
}
