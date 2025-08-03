<!-- .vitepress/theme/MainLayout.vue -->
<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
// 组件1
import backtotop from "../components/BackTop.vue";
</script>

<template>
  <DefaultTheme.Layout v-bind="$attrs">

		<!-- doc-before插槽 -->
    <template #doc-before>
      <ArticleMetadata />
    </template>

    <!-- doc-footer-before插槽 -->
    <template #doc-footer-before>
      <backtotop />
    </template>

  </DefaultTheme.Layout>
</template>

<style scoped>
</style>
