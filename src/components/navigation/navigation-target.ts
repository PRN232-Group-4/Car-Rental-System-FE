/** Hash changes and external destinations do not replace the current page. */
export function isPageNavigation(href: string, currentHref: string): boolean {
  try {
    const current = new URL(currentHref);
    const destination = new URL(href, current);
    return (
      destination.origin === current.origin &&
      (destination.pathname !== current.pathname || destination.search !== current.search)
    );
  } catch {
    return false;
  }
}
