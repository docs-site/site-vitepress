// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import { useData, useRoute } from 'vitepress'

import Linkcard from "./components/Linkcard.vue"
import HomeUnderline from "./components/HomeUnderline.vue"
import ArticleMetadata from "./components/ArticleMetadata.vue"
import MNavLinks from './components/MNavLinks.vue'
import MouseClick from "./components/MouseClick.vue"
import BreadCrumb from './components/BreadCrumb.vue' // 导入BreadCrumb组件
import Catalog from './components/Catalog.vue' // 导入Catalog组件
import DataLoader from './components/DataLoader.vue' // 导入DataLoader组件
import MainLayout from './layout/MainLayout.vue' // 导入布局组件

import codeblocksFold from './plugins/vitepress-code-folding/src/code-folding'; // 导入方法
import giscusTalk from '@docs-site/vitepress-comments';

import './style.css'
import '@docs-site/theme-chalk/src/vp-code.scss'; /* vp-ode styles */
export default {
  extends: DefaultTheme,
  Layout: () => {
    const props: Record<string, any> = {}
    // 获取 frontmatter
    const { frontmatter } = useData()

    /* 添加自定义 class */
    if (frontmatter.value?.layoutClass) {
      props.class = frontmatter.value.layoutClass
    }

    return h(MainLayout, props)
  }, // 使用自定义布局组件
  enhanceApp({ app, router, siteData }) {
    if (typeof window !== 'undefined') {
      setTimeout(async () => {
        try {
          const { setupTabHandler } = await import('./tags/scripts/tab-handler')
          setupTabHandler()
        } catch (e) {
          console.error('初始化选项卡处理器失败:', e)
        }
      }, 0)
    }
    // 注册组件
    app.component('Linkcard', Linkcard)
    app.component('HomeUnderline', HomeUnderline)
    app.component('ArticleMetadata', ArticleMetadata)
    app.component('MNavLinks', MNavLinks)
    app.component('MouseClick', MouseClick)
    app.component('BreadCrumb', BreadCrumb) // 注册BreadCrumb组件
    app.component('Catalog', Catalog) // 注册Catalog组件
    app.component('DataLoader', DataLoader) // 注册DataLoader组件
  },
  setup() {
    const { frontmatter } = useData(); // 获取前言和路由
    const route = useRoute();

    // vitepress-code-folding
    codeblocksFold({ route, frontmatter }); // 基础使用
    // codeblocksFold({ route, frontmatter }, true, 400); // 可配置参数

    // @docs-site/vitepress-comments
    // Obtain configuration from: https://giscus.app/
    giscusTalk({
      repo: 'docs-site/giscus-discussions',
      repoId: 'R_kgDOO2tZSw',
      category: 'General', // default: `General`
      categoryId: 'DIC_kwDOO2tZS84CrFIH',
      mapping: 'pathname', // default: `pathname`
      inputPosition: 'top', // default: `top`
      lang: 'zh-CN', // default: `zh-CN`
      // i18n setting (Note: This configuration will override the default language set by lang)
      // Configured as an object with key-value pairs inside:
      // [your i18n configuration name]: [corresponds to the language pack name in Giscus]
      locales: {
        'zh-Hans': 'zh-CN',
        'en-US': 'en'
      },
      homePageShowComment: false, // Whether to display the comment area on the homepage, the default is false
      lightTheme: 'light', // default: `light`
      darkTheme: 'transparent_dark', // default: `transparent_dark`
      // ...
    }, {
      frontmatter, route
    },
      // Whether to activate the comment area on all pages.
      // The default is true, which means enabled, this parameter can be ignored;
      // If it is false, it means it is not enabled.
      // You can use `comment: true` preface to enable it separately on the page.
      true
    );
  }
} satisfies Theme
