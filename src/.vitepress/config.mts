import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar';
import { getSidebarData, getNavData } from './getNavSidebar.mts'
import markdownTagPlugin from './theme/markdownTagPlugin.mts'
import articleMetadataPlugin from './theme/markdownArticleMetadataPlugin.mts'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "苏木",
  lang: 'zh-CN',
  description: "The development documentation for sumu",
  head: [['link', { rel: 'icon', href: '/site-vitepress/images/favicon_sumu32x32.ico' }]],
  base: '/site-vitepress/',
  lastUpdated: true,     // 启用最后更新时间
  markdown: {
    lineNumbers: true,
    math: true,          // 启用数学公式支持
    image: {
      lazyLoading: true, // 默认禁用图片懒加载
    },
    config: (md) => {
      md.use(markdownTagPlugin) // 使用自定义的markdown插件
      md.use(articleMetadataPlugin) // 使用ArticleMetadata插件
    }
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => ['u', 'emp', 'del', 'kbd', 'wavy', 'psw'].includes(tag) // 允许这些标签作为自定义元素，防止报警告
      }
    }
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    // nav: [
    //   { text: '首页', link: '/' },
    //   { text: 'Examples', link: '/examples/markdown-examples' },
    // ],

    nav: getNavData({ dirName: 'sdoc', maxLevel: 2, debugPrint: false }),
    sidebar: (() => {
      const sidebarData = getSidebarData({ 
        dirName: 'sdoc', 
        maxLevel: 6,
        debugPrint: false 
      })
      if (Object.keys(sidebarData).length === 0) {
        // 若为空，则调用自动侧边栏插件扫描示例目录的侧边栏信息
        return generateSidebar([{
          documentRootPath: 'src',
          scanStartPath: 'examples',
          basePath: '/examples/',
          resolvePath: '/examples/',
          useTitleFromFileHeading: false
        }])
      }
      return sidebarData
    })(),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/docs-site/site-vitepress.git' }
    ],
    logo: '/images/sumu_src.png', // 导航栏标题的logo
    returnToTopLabel: "返回顶部",  // 定义返回顶部按钮的标签，该标签仅在移动端视图中显示。
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outline: {
      label: '页面导航',
      level: [2, 6],
    },
    search: {
      provider: 'local' // 使用本地搜索
    },
    footer: {
      message: '莫道桑榆晚 为霞尚满天.',
      copyright: 'Copyright © 2019-present 苏木'
    }
  },
})
