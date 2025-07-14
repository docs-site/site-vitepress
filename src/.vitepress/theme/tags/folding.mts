import type MarkdownIt from 'markdown-it'

export default function foldingTag(md: MarkdownIt) {
  return (content: string, params?: string) => {
    const trimmedContent = content.replace(/^\n+|\n+$/g, '')
    let color = ''
    let title = '点击展开/折叠'
    
    if (params) {
      if (params.startsWith(',')) {
        title = params.substring(1).trim()
      } else {
        const parts = params.split(',').map(p => p.trim())
        const validColors = ['purple', 'blue', 'cyan', 'green', 'yellow', 
                           'orange', 'red', 'brand', 'tip', 'warning', 'danger']
        
        if (parts.length > 0 && validColors.includes(parts[0])) {
          color = parts[0]
          if (parts.length > 1) {
            title = parts.slice(1).join(',')
          }
        } else {
          title = parts.join(',')
        }
      }
    }
    
    return `
<details class="folding-tag"${color ? ` ${color}` : ''}>
  <summary>${title}</summary>
  <div class="fold-content">${md.render(trimmedContent)}</div>
</details>
`
  }
}
