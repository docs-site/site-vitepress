<template>
  <div class="data-loader">
    <p>页面数据:</p>
    <pre>{{ JSON.stringify(pageData, null, 2) }}</pre>
    
    <p>站点数据:</p>
    <pre>{{ JSON.stringify(siteData, null, 2) }}</pre>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'

const { site, page } = useData()
const siteData = site.value
const pageData = page.value
</script>

<style scoped>
.data-loader {
  border: 1px solid #eee;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 4px;
}
pre {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
