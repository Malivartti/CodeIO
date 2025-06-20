import { ProgrammingLanguage } from '@shared/types/attempt';
import Dropdown from '@shared/ui/Dropdown';
import Tooltip from '@shared/ui/Tooltip';
import { default as cn } from 'classnames';
import { FC } from 'react';

interface Props {
  className?: string;
  selectedLanguage: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
}

const LanguageDropdown: FC<Props> = ({ className, selectedLanguage, onLanguageChange }) => {

  const handleLanguageSelect = (language: ProgrammingLanguage) => {
    onLanguageChange(language);
  };

  const trigger = (
    <Tooltip content="Выбор языка программирования" position="top">
      <button
        type="button"
        className="flex items-center gap-2 border border-surface bg-surface hover:bg-surface-hover active:bg-surface-active rounded-md px-3 py-2 transition-colors min-w-24"
        aria-haspopup="listbox"
      >
        <span className="text-sm text-strong">{selectedLanguage}</span>
      </button>
    </Tooltip>
  );

  const content = (
    <div className="overflow-hidden min-w-32 bg-surface rounded-md py-1">
      {Object.values(ProgrammingLanguage).map(language => (
        <button
          key={language}
          onClick={() => handleLanguageSelect(language)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-surface-hover active:bg-surface-active',
            selectedLanguage === language ? 'bg-surface-accent text-strong' : 'text-medium'
          )}
        >
          <span>{language}</span>
        </button>
      ))}
    </div>
  );

  return (
    <Dropdown
      trigger={trigger}
      content={content}
      placement="center"
      offset={8}
      className={className}
      contentClassName="min-w-32"
    />
  );
};

export default LanguageDropdown;
