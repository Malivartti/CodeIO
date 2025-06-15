import type { Theme } from '@entities/theme';
import { useTheme } from '@entities/theme';
import DarkThemeIcon from '@shared/assets/icons/DarkTheme.svg';
import DownArrowIcon from '@shared/assets/icons/DownArrow.svg';
import LightThemeIcon from '@shared/assets/icons/LightTheme.svg';
import SystemThemeIcon from '@shared/assets/icons/SystemTheme.svg';
import TickIcon from '@shared/assets/icons/Tick.svg';
import { default as cn } from 'classnames';
import { FC, useLayoutEffect, useRef, useState } from 'react';

interface Props {
  className?: string;
}

const themes = [
  {
    value: 'system' as const,
    label: 'Системная',
    icon: <SystemThemeIcon width={24} height={24} className="text-text-secondary" />,
  },
  {
    value: 'light' as const,
    label: 'Светлая',
    icon: <LightThemeIcon width={24} height={24} className="text-yellow-400" />,
  },
  {
    value: 'dark' as const,
    label: 'Темная',
    icon: <DarkThemeIcon width={24} height={24} className="text-indigo-400" />,
  },
];

const ThemeSwitcher: FC<Props> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && btnRef.current && dropdownRef.current) {
      dropdownRef.current.style.minWidth = `${btnRef.current.offsetWidth}px`;
    }
  }, [isOpen]);

  const currentTheme = themes.find((t) => t.value === theme) ?? themes[0];

  const handleThemeSelect = (selected: Theme) => {
    setTheme(selected);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary min-w-[120px] hover:bg-hover transition-colors shadow-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {currentTheme.icon}
        <span className="text-text-primary">{currentTheme.label}</span>
        <DownArrowIcon
          className={cn(
            'ml-auto h-4 w-4 text-text-secondary transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          width={16}
          height={16}
        />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute left-0 mt-2 bg-bg-primary border border-border-primary rounded-lg shadow-lg z-50 overflow-hidden w-max min-w-[120px]'
          )}
        >
          {themes.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleThemeSelect(option.value)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
                'hover:bg-hover focus:bg-hover',
                theme === option.value
                  ? 'bg-bg-accent text-primary font-semibold'
                  : 'text-text-primary'
              )}
              role="option"
              aria-selected={theme === option.value}
            >
              {option.icon}
              <span>{option.label}</span>
              {theme === option.value && (
                <TickIcon className="ml-auto h-4 w-4 text-primary" width={16} height={16} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
