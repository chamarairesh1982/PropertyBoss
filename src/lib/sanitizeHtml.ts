interface DOMPurify {
  sanitize: (html: string) => string;
}

export function sanitizeHtml(input: string): string {
  const purify = (globalThis as unknown as { DOMPurify?: DOMPurify }).DOMPurify;
  if (purify) {
    return purify.sanitize(input);
  }
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
