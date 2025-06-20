import { FC, ReactNode } from 'react';

import Navigation from './Navigation';

interface NavigationItem {
  to: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  navigationItems: NavigationItem[];
  themeSwitcher: ReactNode;
  userProfile: ReactNode;
  className?: string;
}

const MobileMenu: FC<Props> = ({
  isOpen,
  onClose,
  navigationItems,
  themeSwitcher,
  userProfile,
  className,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-overlay backdrop-blur-sm z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        tabIndex={isOpen ? 0 : -1}
        role="button"
        aria-label="Закрыть меню"
      />

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-surface border-l border-surface z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${className || ''}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center px-4 py-2">
            <span className="text-lg font-semibold text-strong">Меню</span>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-surface-hover active:bg-surface-active transition-colors"
              aria-label="Закрыть меню"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="bg-medium h-0.5 w-6 rounded-sm rotate-45 absolute" />
                <span className="bg-medium h-0.5 w-6 rounded-sm -rotate-45 absolute" />
              </div>
            </button>
          </div>

          <div className="border-t border-surface px-4">
            <div className="flex items-center justify-between">
              {themeSwitcher}
              {userProfile}
            </div>
          </div>

          <div className="border-t border-surface my-1" />

          <div className="flex-1 px-4">
            <Navigation
              items={navigationItems}
              variant="vertical"
              onItemClick={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
