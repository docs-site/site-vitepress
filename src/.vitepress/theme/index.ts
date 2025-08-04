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
import MainLayout from './layout/MainLayout.vue' // 导入布局组件

import codeblocksFold from './plugins/vitepress-code-folding/src/code-folding'; // 导入方法

import './style.css'

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
    app.component('Linkcard' , Linkcard)
    app.component('HomeUnderline' , HomeUnderline)
    app.component('ArticleMetadata' , ArticleMetadata)
    app.component('MNavLinks' , MNavLinks)
    app.component('MouseClick' , MouseClick)
    app.component('BreadCrumb', BreadCrumb) // 注册BreadCrumb组件
    app.component('Catalog', Catalog) // 注册Catalog组件
  },
  setup() {
    // 获取前言和路由
    const { frontmatter } = useData();
    const route = useRoute();
    // 基础使用
    codeblocksFold({ route, frontmatter });
    // 可配置参数
    // codeblocksFold({ route, frontmatter }, true, 400);
  }
} satisfies Theme
