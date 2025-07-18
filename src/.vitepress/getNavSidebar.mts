import { resolve, join, sep } from 'path'
import { readdirSync, statSync } from 'fs'
import { DefaultTheme } from 'vitepress'

// 控制台颜色常量
const COLOR = {
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m'
} as const

// 配置常量
const CONFIG = {
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
const DEFAULT_IGNORE_DIRS = ['demo', 'asserts', '.git', '.github', '.docsify'] as const
// 默认忽略的文件 [新增]
const DEFAULT_IGNORE_FILES = ['index.md', '_sidebar.md'] as const

/**
 * @brief 检查导航项是否包含text属性
 * @param v 要检查的导航项
 * @returns 如果包含text属性则返回true，否则返回false
 */
function hasText(v: DefaultTheme.NavItem): v is DefaultTheme.NavItem & { text: string } {
  return 'text' in v
}

/**
 * @brief 侧边栏生成配置接口
 */
interface SidebarGenerateConfig {
  /**
   * 需要遍历的目录
   * @default 'articles'
   */
  dirName?: string
  /**
   * 忽略的文件名 [修改为数组]
   * @default ['index.md']
   */
  ignoreFileNames?: string[]
  /**
   * 忽略的文件夹名称
   * @default ['demo','asserts']
   */
  ignoreDirNames?: string[]
  /**
   * 最大扫描目录深度
   * @default 3
   */
  maxLevel?: number // 覆盖SIDEBAR_MAX_LEVEL
  /**
   * 是否打印调试信息
   * @default false
   */
  debugPrint?: boolean
}

/**
 * @brief 侧边栏项接口
 */
interface SideBarItem {
  /** @brief 显示文本 */
  text: string
  /** @brief 是否可折叠 */
  collapsible?: boolean
  /** @brief 是否默认折叠 */
  collapsed?: boolean
  /** @brief 子项数组 */
  items?: SideBarItem[]
  /** @brief 链接地址 */
  link?: string
}

/**
 * @brief 导航生成配置接口
 */
interface NavGenerateConfig {
  /**
   * 需要遍历的目录
   * @default 'articles'
   */
  dirName?: string
  /**
   * 最大遍历层级
   * @default 1
   */
  maxLevel?: number
  /**
   * 忽略的文件夹名称
   * @default ['demo', 'asserts', '.git', '.github']
   */
  ignoreDirNames?: string[]
  /**
   * 忽略的文件名 [新增]
   * @default ['index.md']
   */
  ignoreFileNames?: string[]
  /**
   * 是否打印调试信息
   * @default false
   */
  debugPrint?: boolean
}

/**
 * @brief 判断是否为markdown文件
 * @param fileName 文件名
 * @returns 如果是markdown文件返回true，否则返回false
 * @note 通过检查文件扩展名是否为.md来判断
 */
function isMarkdownFile(fileName: string) {
  return !!fileName.match(/.+\.md$/) && !fileName.match(/README\.md$/i)
}

// 获取docs目录的完整路径(从根目录一直到docs目录)
const docsDirFullPath = join(__dirname, '../')
// 获取docs目录的完整路径长度
const docsDirFullPathLen = docsDirFullPath.length

/**
 * @brief 获取路径中/docs/后的部分
 * @param dirOrFileFullName 文件或目录完整路径
 * @returns /docs/后的路径部分
 * @example 
 * /a-root/docs/test → /test
 * /a-root-docs/docs/test → /test
 * /a-root-docs/docs/docs/test → /docs/test
 */
function getDocsDirNameAfterStr(dirOrFileFullName: string) {
  // 使用字符串截取方式避免多层目录都叫docs的问题
  return `${sep}${dirOrFileFullName.substring(docsDirFullPathLen)}`
}

/**
 * @brief 生成侧边栏数据
 * @param sidebarGenerateConfig 侧边栏生成配置
 * @returns 生成的侧边栏数据对象
 * @details 遍历指定目录，生成侧边栏树形结构数据
 */
export function getSidebarData(sidebarGenerateConfig: SidebarGenerateConfig = {}) {
  let {
    dirName = sidebarGenerateConfig.dirName || 'articles',
    // 修改：使用数组并合并默认值 [重要修改]
    ignoreFileNames = [...DEFAULT_IGNORE_FILES, ...(sidebarGenerateConfig.ignoreFileNames || [])],
    ignoreDirNames = [...DEFAULT_IGNORE_DIRS, ...(sidebarGenerateConfig.ignoreDirNames || [])],
    maxLevel = sidebarGenerateConfig.maxLevel || CONFIG.SIDEBAR.DEFAULT_LEVEL,
    debugPrint = false
  } = sidebarGenerateConfig

  // 验证侧边栏层级
  if (maxLevel > CONFIG.SIDEBAR.MAX_LEVEL) {
    console.warn(
      `${COLOR.YELLOW}[WARN] Sidebar level ${maxLevel} exceeds max limit ${CONFIG.SIDEBAR.MAX_LEVEL}, using default ${CONFIG.SIDEBAR.DEFAULT_LEVEL}${COLOR.RESET}`
    )
    maxLevel = CONFIG.SIDEBAR.DEFAULT_LEVEL
  }

  // 获取目录的绝对路径
  const dirFullPath = resolve(__dirname, `../${dirName}`)
  let allDirAndFileNameArr: string[] = []
  try {
    // 读取目录下所有文件和子目录
    allDirAndFileNameArr = readdirSync(dirFullPath)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return {}
    }
    throw e
  }
  const obj = {}

  // 遍历目录下的每个子项
  allDirAndFileNameArr.map(dirName => {
    let subDirFullName = join(dirFullPath, dirName)
    const stats = statSync(subDirFullName)

    // 生成侧边栏项的key和对应的树形数据
    let property = getDocsDirNameAfterStr(subDirFullName).replace(/\\/g, '/')
    if (stats.isDirectory()) {
      property += '/'
    }
    // 修改：传递ignoreFileNames数组 [重要修改]
    const arr = getSideBarItemTreeData(subDirFullName, 1, maxLevel, ignoreFileNames, ignoreDirNames)

    // 确保不重复添加相同的路径
    if (!obj[property]) {
      obj[property] = arr
    } else {
      obj[property] = [...obj[property], ...arr]
    }
  })

  if (debugPrint) {
    console.log('Generated Sidebar Data:', JSON.stringify(obj, (key, value) => {
      if (key === 'link') {
        return value || 'undefined'
      }
      return value
    }, 2))
  }
  return obj
}

/**
 * @brief 递归生成侧边栏树形数据
 * @param dirFullPath 当前目录完整路径
 * @param level 当前层级
 * @param maxLevel 最大允许层级
 * @param ignoreFileNames 要忽略的文件名数组 [修改为数组]
 * @param ignoreDirNames 要忽略的目录名数组
 * @returns 生成的侧边栏项数组
 * @details 递归遍历目录结构，生成树形侧边栏数据
 */
function getSideBarItemTreeData(
  dirFullPath: string,
  level: number,
  maxLevel: number,
  ignoreFileNames: string[], // 修改：数组类型
  ignoreDirNames: string[]
): SideBarItem[] {
  const result: SideBarItem[] = []
  let allDirAndFileNameArr: string[] = []

  try {
    const stats = statSync(dirFullPath)
    if (stats.isDirectory()) {
      // 读取当前目录下所有文件和子目录
      allDirAndFileNameArr = readdirSync(dirFullPath)
    } else if (isMarkdownFile(dirFullPath)) {
      // 如果是单个markdown文件，直接处理
      const fileName = dirFullPath.split(sep).pop() || ''
      // 修改：检查是否在忽略列表中 [重要修改]
      if (!ignoreFileNames.includes(fileName)) {
        const matchResult = fileName.match(/(.+)\.md/)
        let text = matchResult ? matchResult[1] : fileName
        text = text.match(/^[0-9]{2}-.+/) ? text.substring(3) : text

        result.push({
          text,
          link: getDocsDirNameAfterStr(dirFullPath).replace('.md', '').replace(/\\/g, '/')
        })
      }
      return result
    } else {
      return result
    }
  } catch (e) {
    return result
  }

  // 先处理目录
  allDirAndFileNameArr.forEach((fileOrDirName: string) => {
    const fileOrDirFullPath = join(dirFullPath, fileOrDirName)
    const stats = statSync(fileOrDirFullPath)

    if (stats.isDirectory() && !ignoreDirNames.includes(fileOrDirName)) {
      // 检查是否存在同名的markdown文件
      const hasMatchingMdFile = allDirAndFileNameArr.some(name =>
        (name === `${fileOrDirName}.md` || name === fileOrDirName.replace(/^[0-9]{2}-/, '') + '.md') &&
        // 修改：检查同名文件是否在忽略列表中 [重要修改]
        !ignoreFileNames.includes(name)
      )

      if (!hasMatchingMdFile) {
        // 处理目录名格式(去除前面的数字前缀)
        const text = fileOrDirName.match(/^[0-9]{2}-.+/) ? fileOrDirName.substring(3) : fileOrDirName

        // 创建目录项数据
        const dirData: SideBarItem = {
          text,
          collapsed: true,
        }

        // 如果未达到最大层级，递归处理子目录
        if (level !== maxLevel) {
          dirData.items = getSideBarItemTreeData(
            fileOrDirFullPath,
            level + 1,
            maxLevel,
            ignoreFileNames,
            ignoreDirNames
          )
        }

        // 如果有子项，设置可折叠属性
        if (dirData.items) {
          dirData.collapsible = true
        }

        result.push(dirData)
      }
    }
  })

  // 后处理文件
  allDirAndFileNameArr.forEach((fileOrDirName: string) => {
    const fileOrDirFullPath = join(dirFullPath, fileOrDirName)
    const stats = statSync(fileOrDirFullPath)

    // 修改：检查是否在忽略列表中 [重要修改]
    if (isMarkdownFile(fileOrDirName) && !ignoreFileNames.includes(fileOrDirName)) {
      // 处理文件项
      const matchResult = fileOrDirName.match(/(.+)\.md/)
      let text = matchResult ? matchResult[1] : fileOrDirName
      // 处理文件名格式(去除前面的数字前缀)
      text = text.match(/^[0-9]{2}-.+/) ? text.substring(3) : text

      // 创建文件项数据
      const fileData: SideBarItem = {
        text,
        link: getDocsDirNameAfterStr(fileOrDirFullPath).replace('.md', '').replace(/\\/g, '/'),
      }

      result.push(fileData)
    }
  })

  return result
}

/**
 * @brief 生成导航数据
 * @param navGenerateConfig 导航生成配置
 * @returns 生成的导航数据数组
 * @details 根据配置生成顶部导航栏数据
 */
export function getNavData(navGenerateConfig: NavGenerateConfig = {}) {
  let {
    dirName = navGenerateConfig.dirName || 'articles',
    maxLevel = navGenerateConfig.maxLevel || CONFIG.NAV.DEFAULT_LEVEL,
    ignoreDirNames = [...DEFAULT_IGNORE_DIRS, ...(navGenerateConfig.ignoreDirNames || [])],
    // 新增：忽略文件配置 [重要修改]
    ignoreFileNames = [...DEFAULT_IGNORE_FILES, ...(navGenerateConfig.ignoreFileNames || [])],
    debugPrint = false
  } = navGenerateConfig

  // 验证导航栏层级
  if (maxLevel > CONFIG.NAV.MAX_LEVEL) {
    console.warn(
      `${COLOR.YELLOW}[WARN] Nav level ${maxLevel} exceeds max limit ${CONFIG.NAV.MAX_LEVEL}, using default ${CONFIG.NAV.DEFAULT_LEVEL}${COLOR.RESET}`
    )
    maxLevel = CONFIG.NAV.DEFAULT_LEVEL
  }
  // 获取目录绝对路径
  const dirFullPath = resolve(__dirname, `../${dirName}`)
  // 生成导航数据 [修改：传递ignoreFileNames]
  let result = getNavDataArr(dirFullPath, 1, maxLevel, ignoreDirNames, ignoreFileNames)

  // 如果结果为空，添加默认导航项
  if (result.length === 0) {
    result.push({
      text: dirName,
      link: `/${dirName}/`,
      activeMatch: `/${dirName}/`
    })
  }

  if (debugPrint) {
    console.log('Generated Nav Data:', JSON.stringify(result, (key, value) => {
      if (key === 'link' || key === 'activeMatch') {
        return value || 'undefined'
      }
      return value
    }, 2))
  }

  return result
}

/**
 * @brief 递归生成导航数据数组
 * @param dirFullPath 当前目录完整路径
 * @param level 当前层级
 * @param maxLevel 最大允许层级
 * @param ignoreDirNames 要忽略的目录名数组
 * @param ignoreFileNames 要忽略的文件名数组 [新增]
 * @returns 导航项数组
 * @details 递归遍历目录结构，生成导航数据
 */
function getNavDataArr(
  dirFullPath: string,
  level: number,
  maxLevel: number,
  ignoreDirNames: string[] = [],
  ignoreFileNames: string[] = [] // 新增：忽略文件数组
): DefaultTheme.NavItem[] {
  let allDirAndFileNameArr: string[] = []
  try {
    // 读取当前目录下所有文件和子目录
    allDirAndFileNameArr = readdirSync(dirFullPath)
  }
  catch (e) {
    if (e.code === 'ENOENT') {
      return [
        { text: '首页', link: '/' },
        { text: 'Examples', link: '/examples/markdown-examples' }
      ]
    }
    throw e
  }
  const result: DefaultTheme.NavItem[] = []
  // 遍历当前目录下的每个子项
  allDirAndFileNameArr.map((fileOrDirName: string, idx: number) => {
    const fileOrDirFullPath = join(dirFullPath, fileOrDirName)
    const stats = statSync(fileOrDirFullPath)
    // 生成链接路径
    const link = getDocsDirNameAfterStr(fileOrDirFullPath).replace('.md', '').replace(/\\/g, '/')
    // 处理显示文本(去除前面的数字前缀)
    const text = fileOrDirName.match(/^[0-9]{2}-.+/) ? fileOrDirName.substring(3) : fileOrDirName

    // 检查是否存在同名的markdown文件 [修改：添加忽略文件检查]
    const hasMatchingMdFile = allDirAndFileNameArr.some(name =>
      (name === `${fileOrDirName}.md` || name === fileOrDirName.replace(/^[0-9]{2}-/, '') + '.md') &&
      !ignoreFileNames.includes(name) // 新增：忽略特定文件
    )

    if (stats.isDirectory() && !ignoreDirNames.includes(fileOrDirName) && !hasMatchingMdFile) {
      // 处理目录项
      const dirData: any = {
        text,
        link: `${link}/`,
      }

      if (level !== maxLevel) {
        // 获取下一层级的导航数据 [修改：传递ignoreFileNames]
        const arr = getNavDataArr(fileOrDirFullPath, level + 1, maxLevel, ignoreDirNames, ignoreFileNames)
          // 过滤出包含text属性的项
          .filter(hasText)
          // 过滤掉index.md项
          .filter(v => v.text !== 'index.md')

        // 如果有子项，添加到items并移除link
        if (arr.length > 0) {
          dirData.items = arr
          delete dirData.link
        }
      }

      // 设置激活匹配规则
      dirData.activeMatch = link + '/'
      result.push(dirData)
    }
    else if (isMarkdownFile(fileOrDirName) && !hasMatchingMdFile) {
      if (0) {// 不添加文档到导航栏
        // 处理文件项
        const fileData: DefaultTheme.NavItem = {
          text,
          link,
        }
        // 设置激活匹配规则
        fileData.activeMatch = link + '/'
        result.push(fileData)
      }
    }
  })

  return result
}
