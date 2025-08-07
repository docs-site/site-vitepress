# vitepress-nav-sidebar

A VitePress plugin for automatically generating navigation and sidebar data.

## Installation

```bash
npm install @docs-site/vitepress-nav-sidebar
```

## Usage

### Importing the functions

```typescript
import { getNavData, getSidebarData } from '@docs-site/vitepress-nav-sidebar'
```

### Generating Navigation Data

```typescript
const navData = getNavData({
  dirName: 'sdoc',
  maxLevel: 2,
  debugPrint: false
}, '/path/to/docs/root')
```

### Generating Sidebar Data

```typescript
const sidebarData = getSidebarData({
  dirName: 'sdoc',
  maxLevel: 6,
  debugPrint: false
}, '/path/to/docs/root')
```

### Configuration Options

#### SidebarGenerateConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| dirName | string | 'articles' | Directory to scan for sidebar items |
| ignoreFileNames | string[] | ['index.md', '_sidebar.md'] | Files to ignore |
| ignoreDirNames | string[] | ['demo', 'asserts', '.git', '.github', '.docsify'] | Directories to ignore |
| maxLevel | number | 3 | Maximum depth to scan |
| debugPrint | boolean | false | Print debug information |

#### NavGenerateConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| dirName | string | 'articles' | Directory to scan for navigation items |
| maxLevel | number | 2 | Maximum depth to scan |
| ignoreDirNames | string[] | ['demo', 'asserts', '.git', '.github', '.docsify'] | Directories to ignore |
| ignoreFileNames | string[] | ['index.md', '_sidebar.md'] | Files to ignore |
| debugPrint | boolean | false | Print debug information |

## Example VitePress Configuration

```typescript
import { defineConfig } from 'vitepress'
import { getNavData, getSidebarData } from '@docs-site/vitepress-nav-sidebar'
import { join } from 'path'

const docsRootDir = join(__dirname, '..')

export default defineConfig({
  themeConfig: {
    nav: getNavData({ 
      dirName: 'sdoc', 
      maxLevel: 2, 
      debugPrint: false 
    }, docsRootDir),
    
    sidebar: getSidebarData({ 
      dirName: 'sdoc', 
      maxLevel: 6,
      debugPrint: false 
    }, docsRootDir)
  }
})
