import { useEffect, useState } from 'react';

export type DeviceProfile = 'desktop' | 'touch';

/**
 * Primary-input media query: true only when the device's main input cannot
 * hover and is coarse (fingers). This is device capability, not screen size.
 */
export const TOUCH_MEDIA_QUERY = '(hover: none) and (pointer: coarse)';

const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

interface NavigatorWithHints extends Navigator {
  userAgentData?: { mobile?: boolean };
  maxTouchPoints: number;
}

/**
 * Detects touch-first devices (phones AND tablets) reliably:
 * 1. Primary input is touch (covers Android/iOS tablets in any orientation).
 * 2. iPadOS 13+ masquerades as "MacIntel", so check touch points as fallback.
 * 3. Hybrid laptops with mouse/trackpad keep `(any-hover: hover)` and are
 *    therefore treated as desktop.
 */
export function detectTouchDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  if (window.matchMedia(TOUCH_MEDIA_QUERY).matches) return true;

  const nav = navigator as NavigatorWithHints;
  const looksLikeTouchUA = MOBILE_UA_REGEX.test(nav.userAgent) || nav.userAgentData?.mobile === true;
  const isIpadOs = nav.platform === 'MacIntel' && nav.maxTouchPoints > 1;
  const hasTouchPoints = nav.maxTouchPoints > 0;
  const cannotHover = !window.matchMedia('(any-hover: hover)').matches;

  return (looksLikeTouchUA || isIpadOs) && hasTouchPoints && cannotHover;
}

/** Reactive device profile: re-evaluates when the primary input changes. */
export function useDeviceProfile(): DeviceProfile {
  return useIsTouchDevice() ? 'touch' : 'desktop';
}

/** Reactive boolean for components that only need the touch branch. */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => detectTouchDevice());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(TOUCH_MEDIA_QUERY);
    const update = () => setIsTouch(detectTouchDevice());

    if (mql.addEventListener) {
      mql.addEventListener('change', update);
    } else {
      mql.addListener(update);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', update);
      } else {
        mql.removeListener(update);
      }
    };
  }, []);

  return isTouch;
}
