import type MarkdownIt from 'markdown-it'

export default function warningTag(md: MarkdownIt) {
  return (content: string) => `<div class="warning">${md.render(content)}</div>`
}
