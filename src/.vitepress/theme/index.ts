// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Linkcard from "./components/Linkcard.vue"
import HomeUnderline from "./components/HomeUnderline.vue"
import ArticleMetadata from "./components/ArticleMetadata.vue"
import MainLayout from './layout/MainLayout.vue' // 导入布局组件

import './style.css'

export default {
  extends: DefaultTheme,
  Layout: MainLayout, // 使用自定义布局组件
  enhanceApp({ app, router, siteData }) {
    if (typeof window !== 'undefined') {
      setTimeout(async () => {
        try {
          const { setupTabHandler } = await import('./scripts/tab-handler')
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
  }
} satisfies Theme
