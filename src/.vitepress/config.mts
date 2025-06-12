import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "苏木",
  lang: 'zh-CN',
  description: "The development documentation for sumu",
  head: [['link', { rel: 'icon', href: '/images/favicon_sumu32x32.ico' }]],
  base: '/site-vitepress/',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: 'Examples', link: '/examples/markdown-examples' },
    ],

    sidebar: generateSidebar([{
      // VitePress Sidebar's options here...
	  documentRootPath: 'src',
      scanStartPath: 'examples',
      basePath: '/examples/',
      resolvePath: '/examples/',
      useTitleFromFileHeading: false
    }]),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/docs-site/site-vitepress.git' }
    ],
	logo: '/images/sumu_src.png', // 导航栏标题的logo
	returnToTopLabel: "返回顶部",  // 定义返回顶部按钮的标签，该标签仅在移动端视图中显示。
	docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
  }
})
