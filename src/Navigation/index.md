---
layout: doc
layoutClass: m-nav-layout
sidebar: false
prev: false
next: false
outline: [2, 3, 4]
---

<style src="/.vitepress/theme/styles/nav.css"></style>

<script setup>
import { NAV_DATA } from '/.vitepress/theme/helpers/data'
</script>


# 我的导航

<MNavLinks v-for="{title, items} in NAV_DATA" :title="title" :items="items"/>
