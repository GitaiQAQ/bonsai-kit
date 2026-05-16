/**
 * makeDraggable — Attach drag-to-move behavior to a host element using fixed positioning.
 *
 * @param {HTMLElement} host
 * @param {HTMLElement} handle
 * @param {object} opts
 * @param {(pos:{left:number,top:number}) => void} [opts.onEnd]
 * @param {() => {left:number,top:number} | null} [opts.initial]
 * @returns {() => void} detach
 */
export function makeDraggable(host, handle, opts = {}) {
  let dragging = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;
  let moved = false;

  const init = opts.initial?.();
  if (init) {
    host.style.left = `${init.left}px`;
    host.style.top  = `${init.top}px`;
    host.style.right = 'auto'; host.style.bottom = 'auto';
  }

  const onDown = (e) => {
    if (e.button !== 0) return;
    const rect = host.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    startX = e.clientX; startY = e.clientY;
    dragging = true; moved = false;
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  const onMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    const left = clamp(startLeft + dx, 0, window.innerWidth  - host.offsetWidth);
    const top  = clamp(startTop  + dy, 0, window.innerHeight - host.offsetHeight);
    host.style.left = `${left}px`;
    host.style.top  = `${top}px`;
    host.style.right = 'auto'; host.style.bottom = 'auto';
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    if (moved && opts.onEnd) {
      const rect = host.getBoundingClientRect();
      opts.onEnd({ left: rect.left, top: rect.top });
    }
    if (moved) {
      const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      handle.addEventListener('click', stop, { once: true, capture: true });
    }
  };

  handle.addEventListener('mousedown', onDown);
  return () => handle.removeEventListener('mousedown', onDown);
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
