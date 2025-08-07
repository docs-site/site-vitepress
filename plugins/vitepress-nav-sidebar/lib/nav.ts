import { resolve, join } from 'path'
import { readdirSync, statSync } from 'fs'
import { DefaultTheme } from 'vitepress'
import { NavGenerateConfig } from './types.js'
import { COLOR, CONFIG, DEFAULT_IGNORE_DIRS, DEFAULT_IGNORE_FILES, getDocsDirNameAfterStr, isMarkdownFile, hasText } from './helper.js'

// 获取docs目录的完整路径(从根目录一直到docs目录)
const docsDirFullPath = join(process.cwd(), 'src')
// 获取docs目录的完整路径长度
const docsDirFullPathLen = docsDirFullPath.length

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
    // 忽略文件配置
    ignoreFileNames = [...DEFAULT_IGNORE_FILES, ...(navGenerateConfig.ignoreFileNames || [])],
    debugPrint = false,
    rootDir = navGenerateConfig.rootDir || 'src'
  } = navGenerateConfig

  // 验证导航栏层级
  if (maxLevel > CONFIG.NAV.MAX_LEVEL) {
    console.warn(
      `${COLOR.YELLOW}[WARN] Nav level ${maxLevel} exceeds max limit ${CONFIG.NAV.MAX_LEVEL}, using default ${CONFIG.NAV.DEFAULT_LEVEL}${COLOR.RESET}`
    )
    maxLevel = CONFIG.NAV.DEFAULT_LEVEL
  }
  // 获取目录绝对路径 process.cwd()= site-vitepress所在目录
  const dirFullPath = resolve(process.cwd(), `${rootDir}/${dirName}`)
  // 生成导航数据 [传递ignoreFileNames]
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
    console.log("process.cwd()=", process.cwd())
    console.log("getNavData dirFullPath: ", dirFullPath)
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
 * @param ignoreFileNames 要忽略的文件名数组
 * @returns 导航项数组
 * @details 递归遍历目录结构，生成导航数据
 */
function getNavDataArr(
  dirFullPath: string,
  level: number,
  maxLevel: number,
  ignoreDirNames: string[] = [],
  ignoreFileNames: string[] = []
): DefaultTheme.NavItem[] {
  let allDirAndFileNameArr: string[] = []
  try {
    // 读取当前目录下所有文件和子目录
    allDirAndFileNameArr = readdirSync(dirFullPath)
  }
  catch (e: any) {
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
    const link = getDocsDirNameAfterStr(fileOrDirFullPath, docsDirFullPathLen).replace('.md', '').replace(/\\/g, '/')
    // 处理显示文本(去除前面的数字前缀)
    const text = fileOrDirName.match(/^[0-9]{2}-.+/) ? fileOrDirName.substring(3) : fileOrDirName

    // 检查是否存在同名的markdown文件
    const hasMatchingMdFile = allDirAndFileNameArr.some(name =>
      (name === `${fileOrDirName}.md` || name === fileOrDirName.replace(/^[0-9]{2}-/, '') + '.md') &&
      !ignoreFileNames.includes(name)
    )

    if (stats.isDirectory() && !ignoreDirNames.includes(fileOrDirName) && !hasMatchingMdFile) {
      // 处理目录项
      const dirData: any = {
        text,
        link: `${link}/`,
      }

      if (level !== maxLevel) {
        // 获取下一层级的导航数据
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
