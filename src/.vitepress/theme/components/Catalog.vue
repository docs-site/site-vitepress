<template>
  <div class="catalog-container">
    <h3 class="catalog-title">目录导航</h3>
    <ul class="catalog-list">
      <li v-for="item in catalogData" :key="item.path" class="catalog-item">
        <a :href="withBase(item.path)" class="catalog-link">{{ item.title }}</a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useData, withBase } from 'vitepress'

interface CatalogItem {
  path: string
  title: string
}

const catalogData = ref<CatalogItem[]>([])
const { page } = useData()

onMounted(async () => {
  try {
    // 获取当前页面路径
    const currentPath = page.value.filePath
    if (!currentPath) return
    
    // 将文件路径转换为页面路径
    const pagePath = currentPath
      .replace(/^src\//, '')
      .replace(/\.md$/, '')
      .replace(/\\/g, '/')
    
    // 动态导入虚拟模块
    const catalogModule = await import('@site/catalog')
    if (typeof catalogModule.default === 'function') {
      const result = await catalogModule.default(pagePath)
      catalogData.value = Array.isArray(result) ? result : []
    } else {
      catalogData.value = []
    }
  } catch (error) {
    console.error('Failed to load catalog data:', error)
    catalogData.value = []
  }
})
</script>

<style scoped>
.catalog-container {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f8fafc;
}

.catalog-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.catalog-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.catalog-item {
  margin: 8px 0;
}

.catalog-link {
  display: block;
  padding: 8px 12px;
  color: #475569;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 14px;
}

.catalog-link:hover {
  background-color: #e2e8f0;
  color: #1e293b;
  transform: translateX(4px);
}

.catalog-link:active {
  background-color: #cbd5e1;
}
</style>
