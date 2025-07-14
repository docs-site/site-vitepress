/**
 * @file tab-handler.js
 * @brief 标签页(tabs)交互处理逻辑
 * @return {void} 无返回值
 */
export function setupTabHandler() {
  /**
   * 初始化所有tabs容器
   * 确保每个tabs容器默认激活第一个选项卡
   */
  document.querySelectorAll('.tabs').forEach(tabs => {
    // 获取当前tabs容器内的所有选项卡和内容面板
    const navItems = tabs.querySelectorAll('.nav-tabs .tab')
    const panes = tabs.querySelectorAll('.tab-content .tab-pane')
    
    /**
     * 检查并设置默认激活状态：
     * 1. 确保存在选项卡和内容面板
     * 2. 当前没有已激活的选项卡时才设置默认激活
     */
    if (navItems.length > 0 && panes.length > 0 && 
        !tabs.querySelector('.nav-tabs .tab.active')) {
      navItems[0].classList.add('active')
      panes[0].classList.add('active')
    }
  })

  /**
   * 监听文档点击事件，处理选项卡切换
   */
  document.addEventListener('click', function(e) {
    // 检查点击的是否是选项卡链接
    const tabLink = e.target.closest('.nav-tabs li.tab a');
    if (tabLink) {
      e.preventDefault(); // 阻止默认链接行为
      
      // 获取点击的选项卡元素
      const tab = tabLink.closest('li.tab');
      if (!tab) return;
      
      /**
       * 切换选项卡激活状态：
       * 1. 只处理当前tabs容器内的状态变化
       * 2. 不影响其他tabs容器的状态
       */
      const tabsContainer = tab.closest('.tabs');
      if (tabsContainer) {
        // 移除当前tabs容器内所有选项卡和内容面板的active状态
        tabsContainer.querySelectorAll('.nav-tabs .tab').forEach(t => t.classList.remove('active'));
        tabsContainer.querySelectorAll('.tab-content .tab-pane').forEach(p => p.classList.remove('active'));
      }
      
      // 设置当前点击的选项卡为激活状态
      tab.classList.add('active');
      
      // 获取并激活对应的内容面板
      const paneId = tab.getAttribute('data-tab');
      if (!paneId) return;
      
      const pane = document.getElementById(paneId);
      if (pane) {
        pane.classList.add('active');
      } else {
        console.warn(`找不到对应的内容面板: ${paneId}`);
      }
    }
  });
}
