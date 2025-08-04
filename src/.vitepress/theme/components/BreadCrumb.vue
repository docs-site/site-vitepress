<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';

const { page, site } = useData();

const currentDocPath = computed(() => {
  return page.value.filePath || '路径未知';
});

const pathSegments = computed(() => {
  const path = currentDocPath.value;
  if (!path || path === '路径未知') {
    return [{ name: '路径未知', link: null, isFile: true }];
  }

  const segments = path.split('/');
  const pathData = [];
  let currentPathBuilder = '';

  segments.forEach((segment, index) => {
    const isFile = index === segments.length - 1;
    let link = null;

    if (!isFile) {
      // For directories, build the path and append 'index.md'
      // The first segment might be empty if path starts with '/', but split handles it.
      currentPathBuilder += (currentPathBuilder === '' ? '' : '/') + segment;
      // Prepend the VitePress base path to ensure correct routing
      link = `${site.value.base}${currentPathBuilder}/`;
    }
    
    pathData.push({
      name: segment,
      link: link,
      isFile: isFile
    });
  });

  return pathData;
});
</script>

<template>
  <div class="breadcrumb">
    <div class="path-display">
      <svg t="1754273199923" class="breadcrumb-home-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1494" width="200" height="200"><path style="fill: currentColor;" d="M946.5 505L560.1 118.8l-25.9-25.9c-12.3-12.2-32.1-12.2-44.4 0L77.5 505c-12.3 12.3-18.9 28.6-18.8 46 0.4 35.2 29.7 63.3 64.9 63.3h42.5V940h691.8V614.3h43.4c17.1 0 33.2-6.7 45.3-18.8 12.1-12.1 18.7-28.2 18.7-45.3 0-17-6.7-33.1-18.8-45.2zM568 868H456V664h112v204z m217.9-325.7V868H632V640c0-22.1-17.9-40-40-40H432c-22.1 0-40 17.9-40 40v228H238.1V542.3h-96l370-369.7 23.1 23.1L882 542.3h-96.1z" p-id="1495"></path></svg>
      <template v-for="(segment, index) in pathSegments" :key="index">
        <a v-if="segment.link && !segment.isFile" :href="segment.link" class="path-segment-link">{{ segment.name }}</a>
        <span v-else class="path-segment-file">{{ segment.name }}</span>
        <span v-if="index < pathSegments.length - 1" class="path-separator"> » </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.path-display {
  background-color: var(--vp-c-bg-mute);
  padding: 0.5rem 0.5rem 0.5rem 0;
  border-radius: 4px;
  margin: 0;
  color: var(--vp-c-text-2);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.path-segment-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  padding: 0.1em 0.2em;
  border-radius: 3px;
  transition: background-color 0.2s;
  font-size: 0.9em; /* Make link font smaller */
}

.path-segment-link:hover {
  background-color: var(--vp-c-brand-dimm);
  color: rgba(255, 166, 0, 0.753);
}

.path-segment-file {
  color: var(--vp-c-text-2);
  padding: 0.1em 0.2em;
  font-weight: 500;
  font-size: 0.9em; /* Make file font size consistent with links */
}

.path-separator {
  color: var(--vp-c-text-3);
  margin: 0 0.2em;
  user-select: none; /* Prevent selecting the separator */
}

.breadcrumb-home-icon {
  width: 1em;
  height: 1em;
  color: var(--vp-c-text-1);
  margin-right: 0.1em;
  flex-shrink: 0; /* Prevents the icon from shrinking */
}
</style>
