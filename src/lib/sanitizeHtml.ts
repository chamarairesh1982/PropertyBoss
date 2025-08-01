/**
 * Basic HTML sanitizer used by the app.  It removes script and style tags
 * along with any event handler attributes.  This implementation does not rely
 * on DOMPurify so it can be bundled without external scripts.
 */
export function sanitizeHtml(input: string): string {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  doc.querySelectorAll('script,style').forEach((el) => el.remove());
  doc.body.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      if (/^on/i.test(attr.name) || attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}
