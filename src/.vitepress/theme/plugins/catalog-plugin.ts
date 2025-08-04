/**
 * 虚拟模块说明：
 * 
 * 什么是虚拟模块？
 * 虚拟模块是Vite中的一种特殊模块，它并不对应物理文件系统中的实际文件，
 * 而是在构建时或运行时动态生成内容的模块。通过虚拟模块，我们可以：
 * 
 * 1. 动态生成数据：根据运行时条件生成不同的模块内容
 * 2. 避免物理文件：不需要在文件系统中创建实际的文件
 * 3. 按需加载：只在需要时才生成和加载模块内容
 * 
 * 实现原理：
 * 
 * 开发环境 (Dev Server)：
 * - 通过 resolveId 钩子拦截 '@site/catalog' 模块的导入请求
 * - 通过 load 钩子返回一个包含 fetch 请求的函数
 * - 通过 configureServer 中间件处理实际的 API 请求
 * - 中间件动态扫描文件系统并返回 JSON 数据
 * - 前端组件通过 fetch 获取数据并渲染
 * 
 * 生产环境 (Build)：
 * - buildStart 阶段预扫描所有页面并生成静态数据
 * - generateBundle 阶段将静态数据打包到虚拟模块中
 * - 生成的模块包含完整的目录数据，无需运行时扫描
 * - 前端组件直接导入静态数据，无需网络请求
 * 
 * 这种设计确保了开发环境的灵活性和生产环境的高性能。
 */

import { type Plugin } from 'vite'
import * as fs from 'fs'
import * as path from 'path'

interface CatalogItem {
  path: string
  title: string
}

interface CatalogData {
  [key: string]: CatalogItem[]
}

interface CatalogPluginOptions {
  srcDir?: string
}

export function catalogPlugin(options: CatalogPluginOptions = {}): Plugin {
  const srcDir = options.srcDir || 'src'
  let siteConfig: any = null
  let catalogData: CatalogData = {}

  function getCatalogForPage(pagePath: string, siteConfig: any): CatalogItem[] {
    // 移除开头的斜杠和.html后缀
    const normalizedPath = pagePath.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '')

    // 获取当前页面的目录路径
    const dirPath = path.dirname(normalizedPath === 'index' ? '' : normalizedPath)

    // 查找该目录下的所有md文件
    const rootPath = siteConfig.root || process.cwd()
    const fullPath = path.join(rootPath, srcDir, dirPath)

    if (!fs.existsSync(fullPath)) {
      return []
    }

    const files = fs.readdirSync(fullPath)
    const mdFiles = files.filter(file =>
      file.endsWith('.md') &&
      file !== 'index.md' &&
      file !== 'README.md'
    )

    return mdFiles.map(file => {
      // 直接使用文件名（去掉.md后缀）作为标题
      const title = file.replace('.md', '')

      // 生成路径
      const relativePath = path.join(dirPath, file).replace(/\\/g, '/')

      return {
        path: `/${relativePath}`,
        title
      }
    })
  }

  function scanAllPages(siteConfig: any): CatalogData {
    const rootPath = siteConfig.root || process.cwd()
    const srcPath = path.join(rootPath, srcDir)
    const catalogData: CatalogData = {}

    // 定义需要排除的目录
    const excludedDirs = ['.vitepress', 'public', 'test']

    function scanDirectory(dirPath: string) {
      if (!fs.existsSync(dirPath)) {
        return
      }

      const files = fs.readdirSync(dirPath)

      // 检查当前目录是否有index.md文件
      if (files.includes('index.md')) {
        // 为每个index.md生成目录数据
        const relativePath = path.relative(srcPath, dirPath).replace(/\\/g, '/')
        const pagePath = relativePath === '' ? 'index' : `${relativePath}/index`

        catalogData[pagePath] = getCatalogForPage(pagePath, siteConfig)
      }

      // 递归扫描子目录
      for (const file of files) {
        // 跳过排除的目录
        if (excludedDirs.includes(file)) {
          continue
        }

        const fullPath = path.join(dirPath, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          scanDirectory(fullPath)
        }
      }
    }

    scanDirectory(srcPath)
    return catalogData
  }

  return {
    name: 'vitepress-catalog-plugin',

    /**
     * 配置解析阶段
     * 获取VitePress的站点配置，设置虚拟模块别名
     */
    configResolved(config) {
      // 获取VitePress的配置
      const vitepressConfig = (config as any).vitepress
      if (vitepressConfig && vitepressConfig.site) {
        siteConfig = vitepressConfig.site
      } else {
        // 如果没有找到VitePress配置，使用默认值
        siteConfig = {
          root: process.cwd()
        }
      }
    },

    /**
     * 模块ID解析钩子
     * 当Vite遇到 '@site/catalog' 导入时，返回虚拟模块ID
     */
    resolveId(id) {
      if (id === '@site/catalog') {
        return '@site/catalog' // 返回虚拟模块的ID
      }
      return null // 不是我们要处理的模块，让其他插件处理
    },

    /**
     * 模块加载钩子
     * 为虚拟模块提供源代码（开发环境）
     */
    load(id) {
      if (id === '@site/catalog') {
        // 开发环境下的动态处理
        // 返回一个函数，该函数通过fetch从服务器获取数据
        return `
          export default function(pagePath) {
            // 开发环境下,通过fetch获取实时数据
            // 这样每次访问都能获取最新的文件系统状态
            return new Promise((resolve) => {
              fetch('/@site/catalog?page=' + encodeURIComponent(pagePath))
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(() => resolve([]));
            });
          }
        `
      }
      return null
    },

    /**
     * 开发服务器配置
     * 处理虚拟模块的API请求
     */
    configureServer(server) {
      // 添加中间件处理虚拟模块的API请求
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/@site/catalog')) {
          const url = new URL(req.url, 'http://localhost:5173')
          const pagePath = url.searchParams.get('page')

          if (pagePath && siteConfig) {
            // 动态扫描文件系统并返回数据
            const data = getCatalogForPage(pagePath, siteConfig)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
            return
          }
        }
        next()
      })
    },

    /**
     * 构建开始阶段
     * 在生产构建时预扫描所有页面数据
     */
    buildStart() {
      if (siteConfig) {
        // 在构建时扫描所有页面并生成目录数据
        // 这样生产环境就不需要运行时扫描文件系统
        catalogData = scanAllPages(siteConfig)
      }
    },

    /**
     * 生成打包文件
     * 为生产环境创建包含静态数据的虚拟模块
     */
    generateBundle() {
      // 生成虚拟模块，包含预扫描的静态数据
      this.emitFile({
        type: 'asset',
        fileName: '@site/catalog.js',
        source: `
          // 生产环境：使用预生成的静态数据
          export function getCatalog(pagePath) {
            const catalogData = ${JSON.stringify(catalogData, null, 2)};
            return catalogData[pagePath] || [];
          }
          
          export default function(pagePath) {
            return getCatalog(pagePath);
          }
        `
      })
    }
  }
}
