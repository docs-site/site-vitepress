const fs = require('fs');
const path = require('path');

/**
 * 生成测试目录结构
 * @param {string} baseDir - 基础目录路径 
 * @param {number} depth - 递归深度
 * @param {number} currentDepth - 当前深度（内部使用）
 */
function generateTestStructure(baseDir, depth = 1, currentDepth = 0) {
    // 确保基础目录存在
    fs.mkdirSync(baseDir, { recursive: true });

    // 创建基础文件
    const relativePath = path.relative(path.join(__dirname, '../..'), baseDir).replace(/\\/g, '/');
    fs.writeFileSync(path.join(baseDir, 'one.md'), `# One\nFile path: ${relativePath}/one.md`);
    fs.writeFileSync(path.join(baseDir, 'two.md'), `# Two\nFile path: ${relativePath}/two.md`);
    fs.writeFileSync(path.join(baseDir, 'index.md'), `# Index\nFile path: ${relativePath}/index.md`);

    // 创建子目录（包含层级信息，从1开始计算）
    const dir1 = path.join(baseDir, `subdir1_level${currentDepth+1}`);
    const dir2 = path.join(baseDir, `subdir2_level${currentDepth+1}`);
    
    fs.mkdirSync(dir1, { recursive: true });
    fs.mkdirSync(dir2, { recursive: true });

    // 递归创建子目录结构（如果未达到最大深度）
    if (currentDepth + 1 < depth) {
        generateTestStructure(dir1, depth, currentDepth + 1);
        generateTestStructure(dir2, depth, currentDepth + 1);
    } else {
        // 在最深层级目录中也创建三个文件
        const relativePath1 = path.relative(path.join(__dirname, '../..'), dir1).replace(/\\/g, '/');
        fs.writeFileSync(path.join(dir1, 'one.md'), `# One\nFile path: ${relativePath1}/one.md`);
        fs.writeFileSync(path.join(dir1, 'two.md'), `# Two\nFile path: ${relativePath1}/two.md`);
        fs.writeFileSync(path.join(dir1, 'index.md'), `# Index\nFile path: ${relativePath1}/index.md`);

        const relativePath2 = path.relative(path.join(__dirname, '../..'), dir2).replace(/\\/g, '/');
        fs.writeFileSync(path.join(dir2, 'one.md'), `# One\nFile path: ${relativePath2}/one.md`);
        fs.writeFileSync(path.join(dir2, 'two.md'), `# Two\nFile path: ${relativePath2}/two.md`);
        fs.writeFileSync(path.join(dir2, 'index.md'), `# Index\nFile path: ${relativePath2}/index.md`);
    }
}

// 使用示例：生成3层深度的测试结构
const testDir = path.join(__dirname, 'test_structure');
generateTestStructure(testDir, 7);

console.log(`测试目录结构已生成在: ${testDir}`);
