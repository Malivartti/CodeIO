import type { Theme } from '@entities/theme';
import { useThemeContext } from '@entities/theme';
import DarkThemeIcon from '@shared/assets/icons/DarkTheme.svg';
import LightThemeIcon from '@shared/assets/icons/LightTheme.svg';
import SystemThemeIcon from '@shared/assets/icons/SystemTheme.svg';
import TickIcon from '@shared/assets/icons/Tick.svg';
import Dropdown from '@shared/ui/Dropdown';
import { default as cn } from 'classnames';
import { FC } from 'react';

interface Props {
  className?: string;
}

const themes = [
  {
    value: 'system' as const,
    label: 'Системная',
    icon: <SystemThemeIcon width={24} height={24} className="text-medium" />,
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
  const { theme, setTheme } = useThemeContext();

  const currentTheme = themes.find((t) => t.value === theme) ?? themes[0];

  const handleThemeSelect = (selected: Theme) => {
    setTheme(selected);
  };

  const trigger = (
    <button
      type="button"
      className="flex items-center space-x-2 hover:bg-surface-hover active:bg-surface-active rounded-md px-3 py-2 transition-colors"
      aria-haspopup="listbox"
    >
      {currentTheme.icon}
    </button>
  );

  const content = (
    <div className="overflow-hidden w-40 bg-surface rounded-md">
      {themes.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleThemeSelect(option.value)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors',
            'hover:bg-surface-hover active:bg-surface-active',
            theme === option.value
              ? 'bg-surface-accent text-strong font-semibold'
              : 'text-medium'
          )}
          role="option"
          aria-selected={theme === option.value}
        >
          {option.icon}
          <span>{option.label}</span>
          {theme === option.value && (
            <TickIcon className="ml-auto h-4 w-4 text-strong" width={16} height={16} />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      content={content}
      placement="bottom"
      offset={8}
      className={className}
    />
  );
};

export default ThemeSwitcher;
