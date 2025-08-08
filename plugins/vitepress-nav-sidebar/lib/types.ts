/**
 * @brief 侧边栏生成配置接口
 */
export interface SidebarGenerateConfig {
  dirName?: string           // 需要遍历的目录 @default 'articles'
  ignoreFileNames?: string[] // 忽略的文件名 @default ['index.md']
  ignoreDirNames?: string[]  // 忽略的文件夹名称 @default ['demo','asserts']
  maxLevel?: number          // 默认最大扫描目录深度 @default 3，覆盖SIDEBAR_MAX_LEVEL
  debugPrint?: boolean       // 是否打印调试信息 @default false
  rootDir?: string           // 根目录路径，相对于项目根目录 @default 'src'
}

/**
 * @brief 侧边栏项接口
 */
export interface SideBarItem {
  text: string           // @brief 显示文本
  collapsible?: boolean  // @brief 是否可折叠
  collapsed?: boolean    // @brief 是否默认折叠
  items?: SideBarItem[]  // @brief 子项数组
  link?: string          // @brief 链接地址
}

/**
 * @brief 导航生成配置接口
 */
export interface NavGenerateConfig {
  dirName?: string           // 需要遍历的目录 @default 'articles'
  maxLevel?: number          // 最大遍历层级 @default 1
  ignoreDirNames?: string[]  // 忽略的文件夹名称 @default ['demo', 'asserts', '.git', '.github']
  ignoreFileNames?: string[] // 忽略的文件名 @default ['index.md']
  debugPrint?: boolean       // 是否打印调试信息 @default false
  rootDir?: string           // 根目录路径，相对于项目根目录 @default 'src'
}
