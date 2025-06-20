import { useClickOutside } from '@shared/hooks/useClickOutside';
import {
  Placement,
  useFloatingPosition
} from '@shared/hooks/useFloatingPosition';
import { default as cn } from 'classnames';
import React, {
  FC,
  KeyboardEvent,
  ReactNode,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';

interface Props {
  trigger: ReactNode;
  content: ReactNode;
  placement?: Placement;
  offset?: number;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

const Dropdown: FC<Props> = ({
  trigger,
  content,
  placement = 'bottom',
  offset = 8,
  className,
  contentClassName,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    position,
    isPositioned,
    referenceRef,
    floatingRef,
  } = useFloatingPosition(isOpen, { placement, offset });

  useClickOutside([wrapperRef, floatingRef], () => setIsOpen(false), isOpen);

  const toggle = () => !disabled && setIsOpen((prev) => !prev);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const dropdownContent = (
    <div
      ref={floatingRef as React.RefObject<HTMLDivElement>}
      className={cn(
        'fixed bg-surface border border-surface rounded-lg shadow-lg z-50 transition-opacity duration-150',
        contentClassName,
        isPositioned ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        visibility: isPositioned ? 'visible' : 'hidden',
      }}
      role="listbox"
      aria-label="Раскрывающееся меню"
    >
      {content}
    </div>
  );

  return (
    <div
      ref={wrapperRef}
      className={cn('relative inline-block', className)}
    >
      <div
        ref={referenceRef as React.RefObject<HTMLDivElement>}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-disabled={disabled}
        className={cn(
          'cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {trigger}
      </div>

      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};

export default Dropdown;
