import marked from 'marked'
import DOMPurify from 'dompurify'

export function getMarkdownHtml(markdownStr: string) {
  const html = marked(markdownStr)
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
