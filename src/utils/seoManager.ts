/**
 * Updates the document favicon immediately after an admin changes branding.
 * Uses an existing favicon link where possible and creates one when absent.
 */
export function forceUpdateFavicon(url: string): void {
  if (typeof document === 'undefined' || !url) return;
  const normalizedUrl = url.trim();
  if (!normalizedUrl) return;

  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }

  link.href = normalizedUrl;
  if (/\.svg(?:[?#].*)?$/i.test(normalizedUrl)) link.type = 'image/svg+xml';
  else if (/\.png(?:[?#].*)?$/i.test(normalizedUrl)) link.type = 'image/png';
  else if (/\.ico(?:[?#].*)?$/i.test(normalizedUrl)) link.type = 'image/x-icon';
  else link.removeAttribute('type');
}
