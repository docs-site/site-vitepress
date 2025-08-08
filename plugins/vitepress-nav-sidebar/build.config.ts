import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // 入口文件
  entries: [
    { input: 'lib/index', name: 'index' },
    { input: 'lib/types', name: 'types' },
    { input: 'lib/sidebar', name: 'sidebar' },
    { input: 'lib/nav', name: 'nav' },
    { input: 'lib/helper', name: 'helper' }
  ],
  outDir: 'dist', // 输出目录
  declaration: true, // 声明文件生成
  clean: true, // 清理输出目录
  // 构建配置
  rollup: {
    emitCJS: false,
    inlineDependencies: true
  },
  // 外部依赖
  externals: [
    'vitepress',
    'path',
    'fs'
  ],
  // 钩子函数
  hooks: {
    'build:done': (ctx) => {
      const pkg = require('./package.json')
      console.log(`✅ Build completed successfully! Package: ${pkg.name}@${pkg.version}`)
    }
  }
})
