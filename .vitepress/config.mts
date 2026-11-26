import { defineConfig, type DefaultTheme } from "vitepress";
import { guide, dev, api, sidebar } from "./sidebar.mjs";

const first = (groups: DefaultTheme.SidebarItem[]) => groups[0].items![0].link!;
const match = (groups: DefaultTheme.SidebarItem[]) => {
  const links: string[] = [];
  const walk = (items: DefaultTheme.SidebarItem[]) =>
    items.forEach((i) => {
      if (i.link) links.push(i.link.replace(/\/$/, "/index").slice(1) + "\\.md");
      if (i.items) walk(i.items);
    });
  walk(groups);
  return `^/(${links.join("|")})`;
};

export default defineConfig({
  lang: "zh-CN",
  title: "kmod loader",
  description: "KARDS 的 Lua / C++ 模组加载器：安装、写模组、Lua API。",
  base: "/kmod-docs/",
  srcDir: "src",
  lastUpdated: true,
  // the pages write things like <游戏>\kards in plain text: never read Markdown as HTML
  markdown: { html: false, lineNumbers: false },
  head: [
    ["link", { rel: "icon", href: "/kmod-docs/favicon.png" }],
    ["meta", { name: "theme-color", content: "#2f8f74" }],
  ],
  themeConfig: {
    logo: "/favicon.png",
    nav: [
      { text: "使用指南", link: first(guide), activeMatch: match(guide) },
      { text: "模组开发", link: first(dev), activeMatch: match(dev) },
      { text: "API 参考", link: first(api), activeMatch: match(api) },
      { text: "更新日志", link: "/changelog" },
      {
        text: "下载",
        items: [
          { text: "KMod Launcher（推荐）", link: "https://github.com/CCB-TEAM/KMod-Launcher/releases/latest" },
          { text: "加载器（Windows）", link: "https://github.com/CCB-TEAM/KMod-Loader-Windows/releases/latest" },
          { text: "安装器（Android）", link: "https://github.com/CCB-TEAM/KMod-Loader-Android/releases/latest" },
        ],
      },
    ],
    sidebar: sidebar(),
    socialLinks: [{ icon: "github", link: "https://github.com/CCB-TEAM" }],
    outline: { level: [2, 3], label: "本页内容" },
    editLink: { pattern: "https://github.com/CCB-TEAM/kmod-docs/edit/main/src/:path", text: "在 GitHub 上修改本页" },
    lastUpdated: { text: "最后更新", formatOptions: { dateStyle: "medium" } },
    docFooter: { prev: "上一页", next: "下一页" },
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色",
    darkModeSwitchTitle: "切换到深色",
    sidebarMenuLabel: "目录",
    returnToTopLabel: "回到顶部",
    externalLinkIcon: true,
    notFound: { title: "没有找到这一页", quote: "它可能改名了，试试搜索。", linkText: "回到首页" },
    footer: { message: "MIT 许可证 · KARDS 属于其权利人，本项目与其无关联" },
    search: {
      provider: "local",
      options: {
        miniSearch: {
          options: {
            // Chinese has no spaces: cut it into words; also let "kmod.reload_mod" be found by any of its parts.
            // (This function is copied into the page as text, so it must not use anything from outside.)
            tokenize: (text: string): string[] => {
              const out: string[] = [];
              const seg = new Intl.Segmenter("zh-CN", { granularity: "word" });
              for (const s of seg.segment(text)) {
                if (!s.isWordLike) continue;
                out.push(s.segment);
                const dotted = s.segment.split(/[.:]+/).filter(Boolean);
                const parts = s.segment.split(/[._:]+/).filter(Boolean);
                if (parts.length > 1) out.push(...new Set([...dotted, ...parts].filter((x) => x !== s.segment)));
              }
              return out;
            },
          },
          searchOptions: { combineWith: "AND", prefix: true, fuzzy: 0.1, boost: { title: 4, titles: 2, text: 1 } },
        },
        translations: {
          button: { buttonText: "搜索文档", buttonAriaLabel: "搜索文档" },
          modal: {
            displayDetails: "显示详细内容",
            resetButtonTitle: "清空",
            backButtonTitle: "返回",
            noResultsText: "没有找到",
            footer: { selectText: "打开", navigateText: "选择", closeText: "关闭" },
          },
        },
      },
    },
  },
});
