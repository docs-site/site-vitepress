/**
 * @file site-catalog-types.d.ts
 * @brief 虚拟模块 '@site/catalog' 的类型声明文件
 * @details 该文件为 VitePress 站点的目录插件提供 TypeScript 类型定义。
 *          目录插件通过虚拟模块 '@site/catalog' 提供页面目录数据的动态获取功能。
 */

/**
 * @brief 声明 '@site/catalog' 虚拟模块
 * @details 该模块在开发环境中通过 fetch API 动态获取目录数据，
 *          在生产环境中通过预编译的静态数据提供目录信息。
 */
declare module '@site/catalog' {
  /**
   * @brief 目录项接口
   * @details 定义单个目录条目的结构，包含路径和标题信息
   */
  interface CatalogItem {
    /** @brief 条目对应的页面路径 */
    path: string
    
    /** @brief 条目显示的标题 */
    title: string
  }

  /**
   * @brief 获取指定页面的目录数据
   * @param pagePath - 页面路径
   * @returns 目录项数组
   * @details 根据给定的页面路径，返回同一目录下的所有页面信息
   */
  export default function(pagePath: string): CatalogItem[]
}
