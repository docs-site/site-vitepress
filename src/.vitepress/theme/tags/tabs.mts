import type MarkdownIt from 'markdown-it'

export default function tabsTag(md: MarkdownIt) {
  return (content: string, params?: string) => {
    let uniqueName = 'tabs-' + Math.random().toString(36).substring(2, 9)
    let defaultIndex = 0
      
    if (params) {
      const parts = params.split(',').map(p => p.trim())
      if (parts.length > 0) {
        uniqueName = parts[0] || uniqueName
        if (parts.length > 1) {
          defaultIndex = parseInt(parts[1]) || 0
        }
      }
    }
    
    const id = uniqueName.toLowerCase().replace(/\s+/g, '-')
    const tabPattern = /<!--\s*tab\s*([\p{L}\p{N}_-]*)\s*-->([\s\S]*?)<!--\s*endtab\s*-->/gu
    const tabs: {name: string, content: string}[] = []
    let match
    
    while ((match = tabPattern.exec(content)) !== null) {
      tabs.push({
        name: match[1] || '',
        content: match[2].trim()
      })
    }
    
    if (tabs.length === 0) {
      return `<div class="tabs-error">No tabs found</div>`
    }
    
    defaultIndex = Math.max(0, Math.min(defaultIndex, tabs.length - 1))
    
    let navItems = ''
    tabs.forEach((tab, index) => {
      const tabNum = index + 1
      const activeClass = index === defaultIndex ? ' active' : ''
      const tabName = tab.name ? tab.name : `${uniqueName} ${tabNum}`
      navItems += `<li class="tab${activeClass}" data-tab="${id}-${tabNum}"><a>${tabName}</a></li>`
    })
    
    let panes = ''
    tabs.forEach((tab, index) => {
      const tabNum = index + 1
      const activeClass = index === defaultIndex ? ' active' : ''
      panes += `<div class="tab-pane${activeClass}" id="${id}-${tabNum}">${md.render(tab.content)}</div>`
    })
    
    return `
<div class="tabs" id="${id}">
  <ul class="nav-tabs">${navItems}</ul>
  <div class="tab-content" style="overflow: hidden;">${panes}</div>
</div>`
  }
}
