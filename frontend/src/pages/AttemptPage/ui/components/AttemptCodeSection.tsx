import { useThemeContext } from '@entities/theme';
import { AttemptPublic, ProgrammingLanguage } from '@shared/types/attempt';
import { default as CodeEditorLib } from '@uiw/react-textarea-code-editor';
import { FC } from 'react';

const langMap: Record<ProgrammingLanguage, string> = {
  [ProgrammingLanguage.PYTHON]: 'python',
  [ProgrammingLanguage.JAVASCRIPT]: 'javascript',
  [ProgrammingLanguage.CPP]: 'cpp',
  [ProgrammingLanguage.C]: 'cpp',
  [ProgrammingLanguage.JAVA]: 'java',
  [ProgrammingLanguage.GO]: 'go',
  [ProgrammingLanguage.RUST]: 'rust',
  [ProgrammingLanguage.C_SHARP]: 'csharp',
  [ProgrammingLanguage.KOTLIN]: 'kotlin',
};

interface Props {
  attempt: AttemptPublic;
}

const AttemptCodeSection: FC<Props> = ({ attempt }) => {
  const { actualTheme } = useThemeContext();

  return (
    <div className="rounded-xl">
      <div className="p-4 border-b border-surface">
        <h3 className="text-lg font-medium text-strong">Исходный код</h3>
      </div>

      <div className="p-1">
        <CodeEditorLib
          value={attempt.source_code}
          language={langMap[attempt.programming_language]}
          readOnly
          padding={16}
          data-color-mode={actualTheme}
          style={{
            fontSize: 14,
            backgroundColor: 'var(--color-canvas)',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
            border: '1px solid var(--border-color-surface)',
            borderRadius: '8px',
            minHeight: '200px',
          }}
        />
      </div>
    </div>
  );
};

export default AttemptCodeSection;
