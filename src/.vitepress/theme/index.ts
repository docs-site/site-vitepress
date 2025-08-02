// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import Linkcard from "./components/Linkcard.vue"
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
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
  }
} satisfies Theme
