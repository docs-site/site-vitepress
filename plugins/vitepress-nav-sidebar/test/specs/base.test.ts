import assert from 'assert';
import { describe, it } from 'node:test';
import { getSidebarData, getNavData } from '../../lib/index'
const TEST_ROOT_PATH = 'test'

describe('Test: base test', () => {
  it('[Call Test]Function call testing', () => {
    // 获取侧边栏数据并打印
    const sidebarData = getSidebarData({
      rootDir: TEST_ROOT_PATH,
      dirName: 'resources',
      debugPrint: false
    });
    // console.log('Sidebar Data:');
    // console.log(JSON.stringify(sidebarData, null, 2));

    // 获取导航数据并打印
    const navData = getNavData({
      rootDir: TEST_ROOT_PATH,
      dirName: 'resources',
      debugPrint: false
    });
    // console.log('Nav Data:');
    // console.log(JSON.stringify(navData, null, 2));
  });

  it('[Nav Test]Directory structure generation', () => {
    assert.deepStrictEqual(
      getNavData({
        rootDir: 'test',
        dirName: 'resources',
        debugPrint: false
      }),
      [
        {
          "text": "general",
          "items": [
            {
              "text": ".vitepress",
              "link": "/resources/general/.vitepress/",
              "activeMatch": "/resources/general/.vitepress/"
            },
            {
              "text": "folder",
              "link": "/resources/general/folder/",
              "activeMatch": "/resources/general/folder/"
            },
            {
              "text": "folder-2",
              "link": "/resources/general/folder-2/",
              "activeMatch": "/resources/general/folder-2/"
            }
          ],
          "activeMatch": "/resources/general/"
        }
      ]
    );
  });
  it('[Nav Test]Directory structure generation with ignoreDirNames', () => {
    assert.deepStrictEqual(
      getNavData({
        rootDir: 'test',
        dirName: 'resources',
        debugPrint: false,
        ignoreDirNames: ['.vitepress']
      }),
      [
        {
          "text": "general",
          "items": [
            {
              "text": "folder",
              "link": "/resources/general/folder/",
              "activeMatch": "/resources/general/folder/"
            },
            {
              "text": "folder-2",
              "link": "/resources/general/folder-2/",
              "activeMatch": "/resources/general/folder-2/"
            }
          ],
          "activeMatch": "/resources/general/"
        }
      ]
    );
  });

});
