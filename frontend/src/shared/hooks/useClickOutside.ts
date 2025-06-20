import { RefObject, useEffect } from 'react';

export const useClickOutside = (
  refs: Array<RefObject<HTMLElement | null>>,
  handler: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      const clickedInside = refs.some(
        (ref) => ref.current && ref.current.contains(event.target as Node)
      );

      if (!clickedInside) handler();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, handler, enabled]);
};
