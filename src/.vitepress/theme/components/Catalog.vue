<template>
  <div class="catalog-container">
    <h3 class="catalog-title">目录导航</h3>
    <ul v-if="catalogData.length > 0" class="catalog-list">
      <li v-for="item in catalogData" :key="item.path" class="catalog-item">
        <a :href="withBase(item.path)" class="catalog-link">
          <svg class="catalog-icon" viewBox="0 0 1280 1024" width="16" height="16">
            <path d="M1187.7 905.84H92.3C41.4 905.84 0 864.44 0 813.54V210.46c0-50.9 41.4-92.3 92.3-92.3h1095.38c50.9 0 92.3 41.4 92.3 92.3v603.08c0.02 50.9-41.38 92.3-92.28 92.3z m-880-184.6v-240l123.08 153.84 123.08-153.84v240h123.08V302.76h-123.08l-123.08 153.84-123.08-153.84H184.62v418.46h123.08zM1132.3 512h-123.08V302.76h-123.08V512h-123.08l184.62 215.38L1132.3 512z"/>
          </svg>
          {{ item.title }}
        </a>
      </li>
    </ul>
    <p v-else class="catalog-empty">暂无目录</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'          // Vue 3 Composition API 核心函数
import { useData, withBase } from 'vitepress'  // VitePress 提供的数据访问和基础路径处理函数

// 目录项接口定义，描述单个目录条目的结构
interface CatalogItem {
  path: string   // 条目对应的页面路径
  title: string  // 条目显示的标题
}

// 响应式目录数据数组，存储当前页面的目录信息
const catalogData = ref<CatalogItem[]>([])

// 使用 VitePress 提供的 useData 钩子获取页面数据
const { page } = useData()

/**
 * @brief 组件挂载时加载目录数据
 * 
 * 在组件挂载时异步加载当前页面的目录数据。
 * 通过虚拟模块 '@site/catalog' 获取目录信息。
 */
onMounted(async () => {
  try {
    // 获取当前页面路径
    const currentPath = page.value.filePath
    if (!currentPath) return
    
    // 将文件路径转换为页面路径
    const pagePath = currentPath
      .replace(/^src\//, '')      // 移除 src/ 前缀
      .replace(/\.md$/, '')       // 移除 .md 后缀
      .replace(/\\/g, '/')        // 统一路径分隔符为正斜杠
    
    // 动态导入虚拟模块
    const catalogModule = await import('@site/catalog')
    if (typeof catalogModule.default === 'function') {
      const result = await catalogModule.default(pagePath)
      catalogData.value = Array.isArray(result) ? result : []  // 确保结果是数组格式
    } else {
      catalogData.value = []  // 如果模块默认导出不是函数，则清空目录数据
    }
  } catch (error) {
    console.error('Failed to load catalog data:', error)  // 输出错误信息到控制台
    catalogData.value = []  // 发生错误时清空目录数据
  }
})
</script>

<style scoped>
/* 目录容器样式 */
.catalog-container {
  margin: 15px 0;           /* 外边距：上下15px，左右0 */
  padding: 10px;            /* 内边距：10px */
  border: 1px solid #e2e8f0; /* 边框：1像素浅灰色实线 */
  border-radius: 8px;       /* 圆角：8像素 */
  background-color: #f8fafc; /* 背景色：非常浅的蓝色 */
}

/* 目录标题样式 */
.catalog-title {
  margin: 0 0 8px 0;        /* 外边距：上右下左分别为0,0,8px,0 */
  font-size: 16px;          /* 字体大小：16像素 */
  font-weight: 600;         /* 字体粗细：半粗体 */
  color: #1e293b;           /* 文字颜色：深蓝灰色 */
  border-bottom: 2px solid #e2e8f0; /* 下边框：2像素浅灰色实线 */
  padding-bottom: 6px;      /* 下内边距：6像素 */
}

/* 目录列表样式 */
.catalog-list {
  list-style: none;         /* 列表样式：无 */
  padding: 0;               /* 内边距：0 */
  margin: 0;                /* 外边距：0 */
}

/* 目录项样式 */
.catalog-item {
  margin: 2px 0;            /* 外边距：上下2px，左右0 */
}

/* 目录链接样式 */
.catalog-link {
  display: flex;            /* 显示方式：弹性盒子 */
  align-items: center;      /* 对齐方式：垂直居中 */
  padding: 4px 12px;        /* 内边距：上下4px，左右12px */
  color: #475569;           /* 文字颜色：中等灰色 */
  text-decoration: none;    /* 文本装饰：无（去除下划线） */
  border-radius: 4px;       /* 圆角：4像素 */
  transition: all 0.2s ease; /* 过渡效果：所有属性0.2秒缓动 */
  font-size: 14px;          /* 字体大小：14像素 */
}

/* 目录链接悬停样式 */
.catalog-link:hover {
  background-color: #e2e8f0; /* 背景色：浅灰色 */
  color: #1e293b;           /* 文字颜色：深蓝灰色 */
  transform: translateX(4px); /* 变换效果：向右平移4像素 */
}

/* 目录链接激活样式 */
.catalog-link:active {
  background-color: #cbd5e1; /* 背景色：稍深的灰色 */
}

/* 目录图标样式 */
.catalog-icon {
  margin-right: 8px;        /* 右外边距：8像素 */
  fill: #475569;            /* 填充色：中等灰色 */
  transition: fill 0.2s ease; /* 过渡效果：填充色0.2秒缓动 */
}

/* 目录链接悬停时图标样式 */
.catalog-link:hover .catalog-icon {
  fill: #1e293b;            /* 填充色：深蓝灰色 */
}

/* 暗色主题支持 */

/* 暗色主题下的目录容器样式 */
.dark .catalog-container {
  border: 1px solid #475569; /* 边框：1像素中等灰色实线 */
  background-color: rgba(25, 34, 49, 0.678); /* 背景色：深蓝灰色，透明度80% */
}

/* 暗色主题下的目录标题样式 */
.dark .catalog-title {
  color: #f1f5f9;           /* 文字颜色：非常浅的蓝色 */
  border-bottom: 2px solid rgba(30, 41, 59, 0.8); /* 下边框：2像素深蓝灰色实线，透明度80% */
}

/* 暗色主题下的目录链接样式 */
.dark .catalog-link {
  color: #cbd5e1;           /* 文字颜色：浅灰色 */
}

/* 暗色主题下目录链接悬停样式 */
.dark .catalog-link:hover {
  background-color: #475569; /* 背景色：中等灰色 */
  color: #f1f5f9;           /* 文字颜色：非常浅的蓝色 */
}

/* 暗色主题下的目录图标样式 */
.dark .catalog-icon {
  fill: #cbd5e1;            /* 填充色：浅灰色 */
}

/* 暗色主题下目录链接悬停时图标样式 */
.dark .catalog-link:hover .catalog-icon {
  fill: #f1f5f9;            /* 填充色：非常浅的蓝色 */
}

/* 暗色主题下的空目录提示样式 */
.dark .catalog-empty {
  color: #94a3b8;           /* 文字颜色：中等浅灰色 */
}

/* 空目录提示样式 */
.catalog-empty {
  margin: 0;                /* 外边距：0 */
  padding: 8px;             /* 内边距：8像素 */
  text-align: center;       /* 文本对齐：居中 */
  color: #94a3b8;           /* 文字颜色：中等浅灰色 */
  font-style: italic;       /* 字体样式：斜体 */
}
</style>
