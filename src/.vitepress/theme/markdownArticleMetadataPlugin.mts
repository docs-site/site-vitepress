/**
 * @file markdownArticleMetadataPlugin.mts
 * @description Markdown插件，用于在文档中自动插入ArticleMetadata组件
 * @module markdownArticleMetadataPlugin
 */

import type MarkdownIt from 'markdown-it'

/**
 * @function articleMetadataPlugin
 * @description 文章元数据插件，自动在Markdown文档中插入ArticleMetadata组件
 * @param {MarkdownIt} md - markdown-it实例
 * @returns {void}
 */
export default function articleMetadataPlugin(md: MarkdownIt) {
  /**
   * @rule insert_article_metadata
   * @description 在文档中插入ArticleMetadata组件的规则
   * @param {Object} state - Markdown解析状态
   * @returns {boolean} 是否成功插入
   */
  md.core.ruler.push('insert_article_metadata', (state) => {
    let inserted = false
    let frontmatterEnd = -1
    
    // 查找frontmatter结束位置
    for (let i = 0; i < state.tokens.length; i++) {
      if (state.tokens[i].type === 'frontmatter') {
        frontmatterEnd = i + 1
        break
      }
    }

    /**
     * @description 在frontmatter后插入ArticleMetadata组件
     * @condition 存在frontmatter时
     */
    if (frontmatterEnd > 0) {
      const token = new state.Token('html_block', '', 0)
      token.content = '<ArticleMetadata />'
      state.tokens.splice(frontmatterEnd, 0, token)
      inserted = true
    }
    /**
     * @description 在文档开头插入ArticleMetadata组件 
     * @condition 不存在frontmatter时
     */
    else if (state.tokens.length > 0) {
      const token = new state.Token('html_block', '', 0)
      token.content = '<ArticleMetadata />'
      state.tokens.unshift(token)
      inserted = true
    }

    return inserted
  })
}
