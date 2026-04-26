import { useEffect, useRef, useState } from 'react';

interface Options {
  enabled: boolean;
  onTrigger: () => void;
  /** Travel (in eased px) at which the gesture commits on release. */
  threshold?: number;
  /** Max travel in eased px - the indicator stops moving past this. */
  maxPull?: number;
}

interface State {
  /** Current eased pull distance in CSS pixels. 0 when not pulling. */
  pull: number;
  /** True while the user's finger is down and we're tracking the gesture. */
  pulling: boolean;
  /** True once `pull` has crossed `threshold` - hint "release to refresh". */
  armed: boolean;
}

/**
 * Detects a top-of-page pull-down gesture and calls `onTrigger` on release
 * when the user has dragged past `threshold`. Designed to coexist with the
 * mobile builder's internal scrollers and `RunSwiper` horizontal pages:
 *
 * - At `touchstart`, walks up from the touch target to find the first
 *   scrollable ancestor. The gesture only arms if that ancestor is at
 *   `scrollTop === 0` (or none exists). This is what makes "pull from top"
 *   feel right inside an internal `overflow-y-auto` panel.
 * - On the first move, if the user drags more horizontally than vertically
 *   the gesture is cancelled - this lets `RunSwiper` keep its left/right
 *   page swipe even if the run is scrolled to the top.
 * - Travel is eased (`raw * raw / (raw + 200)`) so the indicator slows
 *   down past ~80px, matching native pull-to-refresh feel.
 */
export function usePullToRefresh({
  enabled,
  onTrigger,
  threshold = 70,
  maxPull = 110,
}: Options): State {
  const [pull, setPull] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [armed, setArmed] = useState(false);

  const onTriggerRef = useRef(onTrigger);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (!enabled) return;

    let tracking = false;
    let decided = false;
    let isPulling = false;
    let isArmed = false;
    let startX = 0;
    let startY = 0;

    function findScrollableAncestor(el: Element | null): Element | null {
      let node: Element | null = el;
      while (node && node !== document.body && node !== document.documentElement) {
        const cs = window.getComputedStyle(node);
        const oy = cs.overflowY;
        if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
          return node;
        }
        node = node.parentElement;
      }
      return null;
    }

    function ease(raw: number): number {
      return (raw * raw) / (raw + 200);
    }

    function reset() {
      tracking = false;
      decided = false;
      isPulling = false;
      isArmed = false;
      setPulling(false);
      setArmed(false);
      setPull(0);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const target = e.target instanceof Element ? e.target : null;
      const scroller = findScrollableAncestor(target);
      const atTop = scroller ? scroller.scrollTop <= 0 : true;
      if (!atTop) return;
      tracking = true;
      decided = false;
      isPulling = false;
      isArmed = false;
      startX = t.clientX;
      startY = t.clientY;
    }

    function onTouchMove(e: TouchEvent) {
      if (!tracking) return;
      const t = e.touches[0];
      const dy = t.clientY - startY;
      const dx = t.clientX - startX;

      if (!decided) {
        if (Math.abs(dx) <= 8 && Math.abs(dy) <= 8) return;
        decided = true;
        if (Math.abs(dx) > Math.abs(dy) || dy <= 0) {
          tracking = false;
          return;
        }
        isPulling = true;
        setPulling(true);
      }

      if (dy <= 0) {
        if (isPulling) {
          isArmed = false;
          setPull(0);
          setArmed(false);
        }
        return;
      }

      const eased = Math.min(maxPull, ease(dy));
      setPull(eased);
      const nowArmed = eased >= threshold;
      if (nowArmed !== isArmed) {
        isArmed = nowArmed;
        setArmed(nowArmed);
      }
    }

    function onTouchEnd() {
      if (!tracking) return;
      const commit = isPulling && isArmed;
      reset();
      if (commit) onTriggerRef.current();
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [enabled, maxPull, threshold]);

  return { pull, pulling, armed };
}
