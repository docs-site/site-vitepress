/**
 * @brief 为什么在TypeScript中显式添加.js后缀？
 * 
 * @details
 * 1. Node.js的ES模块要求导入路径必须包含完整文件名和扩展名
 * 2. TypeScript编译后生成的JS文件会保持原样引用.js文件  
 * 3. 这样可以确保编译后的代码在Node.js环境中能正确解析模块
 */
export { getSidebarData } from './sidebar'
export { getNavData } from './nav'
export * from './types'
