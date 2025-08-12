import { resolve, join, sep } from 'path'
import { readdirSync, statSync } from 'fs'
import { SidebarGenerateConfig, SideBarItem } from './types'
import { 
  COLOR, CONFIG, DEFAULT_IGNORE_DIRS, DEFAULT_IGNORE_FILES, 
  getDocsDirNameAfterStr, isMarkdownFile 
} from './helper'

/**
 * @brief 生成侧边栏数据
 * @param sidebarGenerateConfig 侧边栏生成配置
 * @returns 生成的侧边栏数据对象
 * @details 遍历指定目录，生成侧边栏树形结构数据
 */
export function getSidebarData(sidebarGenerateConfig: SidebarGenerateConfig = {}) {
  let {
    dirName = sidebarGenerateConfig.dirName || 'articles',
    // 使用数组并合并默认值
    ignoreFileNames = [...DEFAULT_IGNORE_FILES, ...(sidebarGenerateConfig.ignoreFileNames || [])],
    ignoreDirNames = [...DEFAULT_IGNORE_DIRS, ...(sidebarGenerateConfig.ignoreDirNames || [])],
    maxLevel = sidebarGenerateConfig.maxLevel || CONFIG.SIDEBAR.DEFAULT_LEVEL,
    debugPrint = false,
    rootDir = sidebarGenerateConfig.rootDir || 'src'
  } = sidebarGenerateConfig

  // 验证侧边栏层级
  if (maxLevel > CONFIG.SIDEBAR.MAX_LEVEL) {
    console.warn(
      `${COLOR.YELLOW}[WARN] Sidebar level ${maxLevel} exceeds max limit ${CONFIG.SIDEBAR.MAX_LEVEL}, using default ${CONFIG.SIDEBAR.DEFAULT_LEVEL}${COLOR.RESET}`
    )
    maxLevel = CONFIG.SIDEBAR.DEFAULT_LEVEL
  }

  // 获取目录的绝对路径
  const dirFullPath = resolve(process.cwd(), `${rootDir}/${dirName}`)
  // 获取root目录路径长度，用于计算相对链接 (相对于rootDir而非dirName)
  const rootDirPath = resolve(process.cwd(), rootDir)
  const rootDirPathLen = rootDirPath.length
  let allDirAndFileNameArr: string[] = []
  try {
    // 读取目录下所有文件和子目录
    allDirAndFileNameArr = readdirSync(dirFullPath)
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return {}
    }
    throw e
  }
  const obj: Record<string, SideBarItem[]> = {}

  // 遍历目录下的每个子项
  allDirAndFileNameArr.map(dirName => {
    let subDirFullName = join(dirFullPath, dirName)
    const stats = statSync(subDirFullName)

    // 生成侧边栏项的key和对应的树形数据
    let property = getDocsDirNameAfterStr(subDirFullName, rootDirPathLen).replace(/\\/g, '/')
    if (stats.isDirectory()) {
      property += '/'
    }
    // 修改：传递ignoreFileNames数组和rootDirPathLen [重要修改]
    const arr = getSideBarItemTreeData(subDirFullName, rootDirPathLen, 1, maxLevel, ignoreFileNames, ignoreDirNames)

    // 确保不重复添加相同的路径
    if (!obj[property]) {
      obj[property] = arr
    } else {
      obj[property] = [...obj[property], ...arr]
    }
  })

  if (debugPrint) {
    console.log("process.cwd()=", process.cwd())
    console.log("getNavData dirFullPath: ", dirFullPath)
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
 * @param rootDirPathLen root目录完整路径长度，用于计算相对链接
 * @param level 当前层级
 * @param maxLevel 最大允许层级
 * @param ignoreFileNames 要忽略的文件名数组
 * @param ignoreDirNames 要忽略的目录名数组
 * @returns 生成的侧边栏项数组
 * @details 递归遍历目录结构，生成树形侧边栏数据
 */
function getSideBarItemTreeData(
  dirFullPath: string,
  rootDirPathLen: number,
  level: number,
  maxLevel: number,
  ignoreFileNames: string[],
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
      // 检查是否在忽略列表中
      if (!ignoreFileNames.includes(fileName)) {
        const matchResult = fileName.match(/(.+)\.md/)
        let text = matchResult ? matchResult[1] : fileName
        text = text.match(/^[0-9]{2}-.+/) ? text.substring(3) : text

        result.push({
          text,
          link: getDocsDirNameAfterStr(dirFullPath, rootDirPathLen).replace('.md', '').replace(/\\/g, '/')
        })
      }
      return result
    } else {
      return result
    }
  } catch (e: any) {
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
        // 检查同名文件是否在忽略列表中
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
            rootDirPathLen,
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

    // 检查是否在忽略列表中
    if (isMarkdownFile(fileOrDirName) && !ignoreFileNames.includes(fileOrDirName)) {
      // 处理文件项
      const matchResult = fileOrDirName.match(/(.+)\.md/)
      let text = matchResult ? matchResult[1] : fileOrDirName
      // 处理文件名格式(去除前面的数字前缀)
      text = text.match(/^[0-9]{2}-.+/) ? text.substring(3) : text

      // 创建文件项数据
      const fileData: SideBarItem = {
        text,
        link: getDocsDirNameAfterStr(fileOrDirFullPath, rootDirPathLen).replace('.md', '').replace(/\\/g, '/'),
      }

      result.push(fileData)
    }
  })

  return result
}
