import { marked } from 'marked'
import DOMPurify from 'dompurify'

DOMPurify.addHook('afterSanitizeAttributes', function (a) {
  if (
    a instanceof HTMLAnchorElement &&
    'target' in a &&
    a.href.startsWith('https://')
  ) {
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.title = '(opens in new tab)'
    a.setAttribute('aria-description', '(opens in new tab)')
  }
})

/** Convert markdown to HTML */
export function getMarkdownHtml(markdownStr: string) {
  let html = marked(markdownStr)

  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
