/**
 * Smooth scroll to an element
 */
export function smoothScrollToElement(elementId: string, offset: number = 100) {
  const element = document.querySelector(`[data-paragraph-id="${elementId}"]`);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

/**
 * Scroll to bottom of page
 */
export function scrollToBottom(smooth: boolean = true) {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
