/**
 * @file theme-chalk.ts
 * @brief 主题样式构建脚本
 * @details 负责编译SCSS样式文件，应用PostCSS处理，并输出CSS文件
 *          主要功能：查找所有SCSS源文件,使用Sass编译SCSS,应用PostCSS插件处理,输出优化后的CSS文件
 */
import { parse, resolve, relative } from "node:path";
import { access, mkdir, writeFile } from "node:fs/promises";

import glob from "fast-glob";
import sass from "sass";
import postcss from "postcss";
import postcssNested from "postcss-nested";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import picocolors from "picocolors";

const isDev = process.env.THEME_CHALK_DEV === "true"; // 开发模式标志 通过环境变量THEME_CHALK_DEV控制
const styleRoot = resolve(__dirname, "src");  // SCSS源文件根目录 路径：src
const distRoot = resolve(__dirname, "dist");  // 编译输出目录 路径：./dist/

console.log(picocolors.blue(`Building theme-chalk in ${isDev ? "development" : "production"} mode...`));
console.log(picocolors.blue(`Source directory: ${styleRoot}`));
console.log(picocolors.blue(`Output directory: ${distRoot}`));

async function buildThemeChalk() {
  // 1. 确保输出目录存在
  try {
    await access(distRoot);
  } catch {
    await mkdir(distRoot, { recursive: true });
  }

  // 2. 查找所有SCSS文件
  const scssFiles = await glob("**/*.scss", {
    cwd: styleRoot,
    absolute: true,
    ignore: ["**/var/**", "**/module/**", "**/mixins/**", "**/common/**"],
  });

  // 3. 编译处理每个SCSS文件
  for (const file of scssFiles) {
    let relativePath = relative(styleRoot, file);
    // 去掉src/前缀
    if (relativePath.startsWith('src/')) {
      relativePath = relativePath.substring(4);
    }
    const { dir, name } = parse(relativePath);
    const outputDir = resolve(distRoot, dir);
    const outputPath = resolve(outputDir, `${name}.css`);
    
    // 确保输出目录存在
    try {
      await access(outputDir);
    } catch {
      await mkdir(outputDir, { recursive: true });
    }
    
    // 3.1 使用Sass编译
    const sassResult = sass.compile(file, {
      style: isDev ? "expanded" : "compressed",
      sourceMap: isDev,
    });

    // 3.2 应用PostCSS处理
    const postcssResult = await postcss([
      postcssNested(),
      autoprefixer(),
      ...(isDev ? [] : [cssnano()]),
    ]).process(sassResult.css, {
      from: file,
      to: outputPath,
      map: isDev ? { prev: sassResult.sourceMap } : false,
    });

    // 3.3 写入输出文件
    await writeFile(outputPath, postcssResult.css);
    if (postcssResult.map) {
      await writeFile(`${outputPath}.map`, postcssResult.map.toString());
    }

    console.log(picocolors.green(`✓ Compiled ${file.replace(styleRoot, "")}`));
  }
}

buildThemeChalk().catch(err => {
  console.error(picocolors.red('Build failed:'));
  console.error(err);
  process.exit(1);
});

