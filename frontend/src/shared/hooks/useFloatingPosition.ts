import React, { useEffect, useRef, useState } from 'react';

export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface FloatingPosition {
  left: number;
  top: number;
}

interface UseFloatingPositionOptions {
  placement?: Placement;
  offset?: number;
  padding?: number;
}

interface UseFloatingPositionReturn {
  position: FloatingPosition;
  isPositioned: boolean;
  referenceRef: React.RefObject<HTMLElement | null>;
  floatingRef: React.RefObject<HTMLElement | null>;
  updatePosition: () => void;
}

export const useFloatingPosition = (
  isOpen: boolean,
  options: UseFloatingPositionOptions = {}
): UseFloatingPositionReturn => {
  const { placement = 'bottom', offset = 16, padding = 16 } = options;

  const [position, setPosition] = useState<FloatingPosition>({ left: 0, top: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const referenceRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);

  const calculatePosition = (): FloatingPosition => {
    if (!referenceRef.current || !floatingRef.current) {
      return { left: 0, top: 0 };
    }

    const referenceRect = referenceRef.current.getBoundingClientRect();
    const floatingRect = floatingRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = 0;
    let top = 0;

    switch (placement) {
      case 'bottom':
        left = referenceRect.left + referenceRect.width / 2 - floatingRect.width / 2;
        top = referenceRect.bottom + offset;
        break;
      case 'top':
        left = referenceRect.left + referenceRect.width / 2 - floatingRect.width / 2;
        top = referenceRect.top - floatingRect.height - offset;
        break;
      case 'right':
        left = referenceRect.right + offset;
        top = referenceRect.top + referenceRect.height / 2 - floatingRect.height / 2;
        break;
      case 'left':
        left = referenceRect.left - floatingRect.width - offset;
        top = referenceRect.top + referenceRect.height / 2 - floatingRect.height / 2;
        break;
      case 'center':
        left = referenceRect.left + referenceRect.width / 2 - floatingRect.width / 2;
        top = referenceRect.bottom + offset;
        break;
    }

    if (left < padding) {
      left = padding;
    } else if (left + floatingRect.width > viewportWidth - padding) {
      left = viewportWidth - floatingRect.width - padding;
    }

    if (placement === 'bottom' && top + floatingRect.height > viewportHeight - padding) {
      top = referenceRect.top - floatingRect.height - offset;
      if (top < padding) {
        top = padding;
      }
    } else if (placement === 'top' && top < padding) {
      top = referenceRect.bottom + offset;
      if (top + floatingRect.height > viewportHeight - padding) {
        top = viewportHeight - floatingRect.height - padding;
      }
    }

    return { left, top };
  };

  const updatePosition = () => {
    if (isOpen && referenceRef.current && floatingRef.current) {
      requestAnimationFrame(() => {
        const newPosition = calculatePosition();
        setPosition(newPosition);
        setIsPositioned(true);
      });
    } else {
      setIsPositioned(false);
    }
  };

  useEffect(() => {
    updatePosition();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      setIsPositioned(false);
      updatePosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return {
    position,
    isPositioned,
    referenceRef,
    floatingRef,
    updatePosition,
  };
};
