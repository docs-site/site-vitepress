import type MarkdownIt from 'markdown-it'

export default function noteTag(md: MarkdownIt) {
  return (content: string) => `<div class="note">${md.render(content)}</div>`
}
