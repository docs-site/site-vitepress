import { useData } from 'vitepress'
import { computed, onMounted, onUnmounted, useTemplateRef } from 'vue'

/**
 * @brief 将指定 refName 的 DOM 元素移动到目标容器，并在组件卸载时复原。
 * 
 * 该函数主要用于在 Vue 组件挂载时将指定的 DOM 元素移动到目标容器中，
 * 并在组件卸载时将元素恢复到原始位置，保持 DOM 结构的完整性。
 * 
 * @param refName - 需要移动的元素的 ref 名称，通过模板引用获取
 * @param targetSelector - 目标容器的 CSS 选择器，默认为 '.VPHero .text'
 * @param clearTarget - 是否清空目标容器内容，默认为 true
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 定义要移动的元素 -->
 *   <div ref="myElement">要移动的内容</div>
 *   <!-- 目标容器 (默认会查找 .VPHero .text) -->
 *   <div class="target-container"></div>
 * </template>
 * 
 * <script setup>
 * import { moveDomElements } from './utils'
 * 
 * // 将 myElement 移动到 .target-container
 * moveDomElements('myElement', '.target-container')
 * </script>
 * ```
 *
 * @description DOM结构变化示例:
 * 
 * // 移动前:
 * // <div ref="myElement">要移动的内容</div>
 * // <div class="target-container"></div>
 * 
 * // 移动后 (挂载时):
 * // <!--moveDomElements-placeholder-->
 * // <div class="target-container">
 * //   <div>要移动的内容</div>
 * // </div>
 * 
 * // 卸载后 (恢复原状):
 * // <div ref="myElement">要移动的内容</div>
 * // <div class="target-container"></div>
 */
export function moveDomElements(refName: string, targetSelector = '.VPHero .text', clearTarget = true) {
  // 获取模板引用对应的 DOM 元素
  const elementRef = useTemplateRef<HTMLElement>(refName)
  // 创建占位注释节点，用于标记元素原始位置
  let placeholder: Comment | null = null

  // 组件挂载时执行移动操作
  onMounted(() => {
    // 查找目标容器
    const target = document.querySelector(targetSelector)
    if (target && elementRef.value) {
      // 1. 在元素原始位置创建注释节点作为占位符
      placeholder = document.createComment('moveDomElements-placeholder')
      elementRef.value.before(placeholder)
      
      // 2. 清空目标容器内容
      target.innerHTML = ''
      
      // 3. 将元素移动到目标容器
      target.appendChild(elementRef.value)
    }
  })

  // 组件卸载时执行恢复操作
  onUnmounted(() => {
    // 如果元素和占位符都存在，则将元素恢复到占位符位置
    elementRef.value && placeholder?.parentNode?.replaceChild(elementRef.value, placeholder)
  })
}

/**
 * 获取当前激活的 locale key（如 `root`、`en`）。
 *
 * @returns 当前激活的 locale key
 */
export function getLocaleKey() {
  const { localeIndex } = useData()
  return computed(() => localeIndex.value)
}
