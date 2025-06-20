import { FC } from 'react';

interface Props {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const MobileMenuButton: FC<Props> = ({ isOpen, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-md hover:bg-surface-hover active:bg-surface-active transition-colors z-50 relative ${className || ''}`}
      aria-label="Открыть меню"
      aria-expanded={isOpen}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`bg-medium h-0.5 w-6 rounded-sm transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-1.5' : ''
          }`}
        />
        <span
          className={`bg-medium h-0.5 w-6 rounded-sm transition-all duration-300 mt-1 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`bg-medium h-0.5 w-6 rounded-sm transition-all duration-300 mt-1 ${
            isOpen ? '-rotate-45 -translate-y-1.5' : ''
          }`}
        />
      </div>
    </button>
  );
};

export default MobileMenuButton;
