import { sep } from 'path'
import { DefaultTheme } from 'vitepress'

// 控制台颜色常量
export const COLOR = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m'
} as const

// 配置常量
export const CONFIG = {
  NAV: {
    DEFAULT_LEVEL: 2,
    MAX_LEVEL: 3
  },
  SIDEBAR: {
    DEFAULT_LEVEL: 3,
    MAX_LEVEL: 6
  }
} as const

// 默认忽略的目录
export const DEFAULT_IGNORE_DIRS = ['demo', 'asserts', '.git', '.github', '.docsify'] as const
// 默认忽略的文件
export const DEFAULT_IGNORE_FILES = ['index.md', '_sidebar.md'] as const

/**
 * @brief 检查导航项是否包含text属性
 * @param v 要检查的导航项
 * @returns 如果包含text属性则返回true，否则返回false
 */
export function hasText(v: DefaultTheme.NavItem): v is DefaultTheme.NavItem & { text: string } {
  return 'text' in v
}

/**
 * @brief 判断是否为markdown文件
 * @param fileName 文件名
 * @returns 如果是markdown文件返回true，否则返回false
 */
export function isMarkdownFile(fileName: string) {
  return !!fileName.match(/.+\.md$/) && !fileName.match(/README\.md$/i)
}

/**
 * @brief 获取路径中/docs/后的部分
 * @param dirOrFileFullName 文件或目录完整路径
 * @param docsDirFullPathLen docs目录完整路径长度
 * @returns /docs/后的路径部分
 * @example 
 * /a-root/docs/test → /test
 * /a-root-docs/docs/test → /test
 * /a-root-docs/docs/docs/test → /docs/test
 */
export function getDocsDirNameAfterStr(dirOrFileFullName: string, docsDirFullPathLen: number) {
  // 使用字符串截取方式避免多层目录都叫docs的问题
  let result = dirOrFileFullName.substring(docsDirFullPathLen)
  // 确保路径以斜杠开头，但不重复添加
  if (!result.startsWith(sep)) {
    result = sep + result
  }
  
  return result
}
