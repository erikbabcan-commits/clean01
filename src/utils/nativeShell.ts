/**
 * Native-app feel for the installed PWA.
 *
 * In a regular browser tab we keep pinch/keyboard zoom available (WCAG 1.4.4
 * "Resize text"). Only when launched as an installed app (display-mode:
 * standalone / fullscreen / window-controls-overlay, or iOS home screen) do we
 * lock the viewport and block zoom gestures so it behaves like a native shell.
 */
const LOCKED_VIEWPORT =
  'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover';

let installed = false;

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = (q: string) => window.matchMedia?.(q).matches ?? false;
  return (
    mq('(display-mode: standalone)') ||
    mq('(display-mode: fullscreen)') ||
    mq('(display-mode: window-controls-overlay)') ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function lockNativeShell() {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  document.documentElement.dataset.standalone = String(isStandalone());
  if (!isStandalone()) return;

  upsertMeta('viewport', LOCKED_VIEWPORT);

  const prevent = (e: Event) => e.preventDefault();
  const opts = { passive: false } as const;

  // iOS Safari ignores user-scalable=no, so block pinch gestures directly
  document.addEventListener('gesturestart', prevent, opts);
  document.addEventListener('gesturechange', prevent, opts);
  document.addEventListener('gestureend', prevent, opts);
  document.addEventListener(
    'touchmove',
    (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    },
    opts,
  );

  // Desktop PWA window: block ctrl/cmd + wheel and keyboard zoom
  window.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    },
    opts,
  );
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault();
  });
}

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}
