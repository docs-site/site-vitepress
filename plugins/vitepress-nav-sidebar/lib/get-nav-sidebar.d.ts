import { DefaultTheme } from 'vitepress';

export interface SidebarGenerateConfig {
  /**
   * 需要遍历的目录
   * @default 'articles'
   */
  dirName?: string;
  /**
   * 忽略的文件名
   * @default ['index.md']
   */
  ignoreFileNames?: string[];
  /**
   * 忽略的文件夹名称
   * @default ['demo','asserts']
   */
  ignoreDirNames?: string[];
  /**
   * 最大扫描目录深度
   * @default 3
   */
  maxLevel?: number;
  /**
   * 是否打印调试信息
   * @default false
   */
  debugPrint?: boolean;
}

export interface SideBarItem {
  /** @brief 显示文本 */
  text: string;
  /** @brief 是否可折叠 */
  collapsible?: boolean;
  /** @brief 是否默认折叠 */
  collapsed?: boolean;
  /** @brief 子项数组 */
  items?: SideBarItem[];
  /** @brief 链接地址 */
  link?: string;
}

export interface NavGenerateConfig {
  /**
   * 需要遍历的目录
   * @default 'articles'
   */
  dirName?: string;
  /**
   * 最大遍历层级
   * @default 1
   */
  maxLevel?: number;
  /**
   * 忽略的文件夹名称
   * @default ['demo', 'asserts', '.git', '.github']
   */
  ignoreDirNames?: string[];
  /**
   * 忽略的文件名
   * @default ['index.md']
   */
  ignoreFileNames?: string[];
  /**
   * 是否打印调试信息
   * @default false
   */
  debugPrint?: boolean;
}

/**
 * @brief 生成侧边栏数据
 * @param sidebarGenerateConfig 侧边栏生成配置
 * @returns 生成的侧边栏数据对象
 * @details 遍历指定目录，生成侧边栏树形结构数据
 */
export function getSidebarData(sidebarGenerateConfig?: SidebarGenerateConfig): DefaultTheme.Sidebar;

/**
 * @brief 生成导航数据
 * @param navGenerateConfig 导航生成配置
 * @returns 生成的导航数据数组
 * @details 根据配置生成顶部导航栏数据
 */
export function getNavData(navGenerateConfig?: NavGenerateConfig): DefaultTheme.NavItem[];
