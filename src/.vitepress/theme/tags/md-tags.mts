import type MarkdownIt from 'markdown-it'
import noteTag from './note.mts'
import warningTag from './warning.mts'
import tabsTag from './tabs.mts'
import foldingTag from './folding.mts'
import simpleTags from './simpleTags.mts'

interface TagPluginOptions {
  tags?: Record<string, (content: string, params?: string) => string>
}

export default function markdownTagPlugin(md: MarkdownIt, options: TagPluginOptions = {}) {
  // Default tags if none provided
  const defaultTags = {
    'note': noteTag(md),
    'warning': warningTag(md),
    'tabs': tabsTag(md),
    'folding': foldingTag(md),
    ...simpleTags(md)
  }

  const tags = options.tags || defaultTags

  const tagPattern = /{%\s*([a-zA-Z0-9_-]+)(?:([^%]*?))?\s*%}([\s\S]*?){%\s*end\1\s*%}|{%\s*([a-zA-Z0-9_-]+)(?:([^%]*?))?\s*%}/g
  const codeBlockPattern = /(```[\s\S]*?```|`[^`]*`)/g

  md.core.ruler.after('normalize', 'custom_tags', (state) => {
    // Mark all code block positions
    const codeBlocks: {start: number, end: number}[] = []
    let codeMatch
    while ((codeMatch = codeBlockPattern.exec(state.src)) !== null) {
      codeBlocks.push({
        start: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length
      })
    }

    // Process tags recursively
    const processTags = (text: string): string => {
      return text.replace(tagPattern, (match, pairedTagName, pairedParams, pairedContent, singleTagName, singleParams, offset) => {
        // Check if inside code block
        const isInCodeBlock = codeBlocks.some(block => 
          offset >= block.start && offset + match.length <= block.end
        )
        if (isInCodeBlock) {
          return match // Skip processing if inside code block
        }

        const tagName = pairedTagName || singleTagName
        const params = pairedParams || singleParams
        
        if (tags[tagName]) {
          // Process nested tags in content first
          const processedContent = pairedContent 
            ? processTags(pairedContent)
            : ''
          
          return tags[tagName](processedContent, params)
        }
        
        return pairedTagName 
          ? `<div class="${tagName}-tag">${md.render(pairedContent)}</div>`
          : `<span class="${tagName}-tag"></span>`
      })
    }

    state.src = processTags(state.src)
  })
}
