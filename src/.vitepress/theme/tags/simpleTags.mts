import type MarkdownIt from 'markdown-it'

export default function simpleTags(md: MarkdownIt) {
  return {
    'u': (content: string, params?: string) => `<u>${params || ''}</u>`,
    'emp': (content: string, params?: string) => `<emp>${params || ''}</emp>`,
    'del': (content: string, params?: string) => `<del>${params || ''}</del>`,
    'kbd': (content: string, params?: string) => `<kbd>${params || ''}</kbd>`,
    'wavy': (content: string, params?: string) => `<wavy>${params || ''}</wavy>`,
    'psw': (content: string, params?: string) => `<psw>${params || ''}</psw>`
  }
}
