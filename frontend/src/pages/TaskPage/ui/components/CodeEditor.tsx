import { useThemeContext } from '@entities/theme';
import { ProgrammingLanguage } from '@shared/types/attempt';
import Tooltip from '@shared/ui/Tooltip';
import { default as CodeEditorLib } from '@uiw/react-textarea-code-editor';
import { default as cn } from 'classnames';
import { FC, memo } from 'react';

import LanguageDropdown from './LanguageDropdown';

const languageConfig: Record<ProgrammingLanguage, { name: string; placeholder: string }> = {
  [ProgrammingLanguage.PYTHON]: {
    name: 'python',
    placeholder: 'def main():\n    pass',
  },
  [ProgrammingLanguage.JAVASCRIPT]: {
    name: 'javascript',
    placeholder: 'function main() {\n    \n}',
  },
  [ProgrammingLanguage.CPP]: {
    name: 'cpp',
    placeholder: '#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}',
  },
  [ProgrammingLanguage.C]: {
    name: 'cpp',
    placeholder: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
  },
  [ProgrammingLanguage.JAVA]: {
    name: 'java',
    placeholder: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
  },
  [ProgrammingLanguage.GO]: {
    name: 'go',
    placeholder: 'package main\n\nimport "fmt"\n\nfunc main() {\n    \n}',
  },
  [ProgrammingLanguage.RUST]: {
    name: 'rust',
    placeholder: 'fn main() {\n    \n}',
  },
  [ProgrammingLanguage.C_SHARP]: {
    name: 'csharp',
    placeholder: 'using System;\n\nclass Program {\n    static void Main() {\n        \n    }\n}',
  },
  [ProgrammingLanguage.KOTLIN]: {
    name: 'kotlin',
    placeholder: 'fun main() {\n    \n}',
  },
};

interface Props {
  selectedLanguage: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
  sourceCode: string;
  onSourceCodeChange: (code: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isAuthorized: boolean;
  taskId?: number;
  className?: string;
}

const CodeEditor: FC<Props> = memo(({
  selectedLanguage,
  onLanguageChange,
  sourceCode,
  onSourceCodeChange,
  onSubmit,
  isSubmitting,
  isAuthorized,
  className,
}) => {
  const { actualTheme } = useThemeContext();

  const getButtonText = (): string => {
    if (isSubmitting) {
      return 'Выполняется...';
    }
    return 'Отправить';
  };

  const getTooltipContent = (): string => {
    if (!isAuthorized) return 'Войдите в систему';
    if (sourceCode.trim() === '') return 'Введите код';
    if (isSubmitting) return 'Решение выполняется, ожидайте результат';
    return '';
  };

  return (
    <div className={cn('rounded-xl', className)}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 sm:p-4 border-b border-surface">
        <h3 className="text-lg font-medium text-strong">Решение</h3>

        <div className="flex flex-row items-center gap-2 xs:gap-3">
          <LanguageDropdown
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />

          <Tooltip
            content={getTooltipContent()}
            position="top"
          >
            <button
              onClick={onSubmit}
              disabled={isSubmitting || sourceCode.trim() === '' || !isAuthorized}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 text-sm font-medium',
                isSubmitting || sourceCode.trim() === '' || !isAuthorized
                  ? 'bg-surface text-subtle cursor-not-allowed'
                  : 'bg-brand hover:bg-brand-hover active:bg-brand-active text-inverse'
              )}
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-inverse border-t-transparent rounded-full animate-spin" />
              )}
              <span className="whitespace-nowrap">{getButtonText()}</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="p-1">
        <CodeEditorLib
          value={sourceCode}
          language={languageConfig[selectedLanguage].name}
          placeholder={languageConfig[selectedLanguage].placeholder}
          onChange={(evn) => onSourceCodeChange(evn.target.value)}
          padding={12}
          data-color-mode={actualTheme}
          readOnly={isSubmitting}
          style={{
            fontSize: window.innerWidth < 640 ? 13 : 14,
            backgroundColor: 'var(--color-canvas)',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            border: '1px solid var(--border-color-surface)',
            borderRadius: '8px',
            minHeight: window.innerWidth < 640 ? '250px' : '300px',
            maxHeight: window.innerWidth < 640 ? '400px' : '600px',
            overflow: 'auto',
            opacity: isSubmitting ? 0.7 : 1,
          }}
        />
      </div>

      {sourceCode && !isAuthorized && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="text-xs text-subtle">
            Код сохраняется в браузере
          </div>
        </div>
      )}
    </div>
  );
});

export default CodeEditor;
