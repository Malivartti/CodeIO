import OListIcon from '@shared/assets/icons/OList.svg';
import UnoListIcon from '@shared/assets/icons/UnoList.svg';
import { observer } from 'mobx-react-lite';
import React, { FC } from 'react';

import { taskEditorStore } from '../model/store';

interface Props {
  className?: string;
}

const EditorToolbar: FC<Props> = observer(({ className }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleBold = () => {
    taskEditorStore.toggleBold();
  };

  const handleItalic = () => {
    taskEditorStore.toggleItalic();
  };

  const handleHeading = (level: number) => {
    taskEditorStore.insertHeading(level);
  };

  const handleList = (ordered = false) => {
    taskEditorStore.insertList(ordered);
  };

  const handleCodeBlock = () => {
    taskEditorStore.insertCodeBlock();
  };

  const buttonClass = 'px-2 py-1 text-sm font-medium text-[var(--color-strong)] bg-[var(--background-color-canvas)] border border-[var(--border-color-surface)] rounded hover:bg-[var(--color-surface-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-colors';

  const dividerClass = 'w-px bg-[var(--border-color-surface)]';

  return (
    <div className={`flex flex-wrap gap-1 sm:gap-2 p-2 border-b border-[var(--border-color-surface)] ${className}`}>
      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleBold}
        className={buttonClass}
        aria-label="Жирность"
      >
        <strong>B</strong>
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleItalic}
        className={buttonClass}
        aria-label="Курсив"
      >
        <em>I</em>
      </button>

      <div className={dividerClass} />

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => handleHeading(1)}
        className={buttonClass}
        aria-label="Заголовок 1 уровня"
      >
        H1
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => handleHeading(2)}
        className={buttonClass}
        aria-label="Заголовок 2 уровня"
      >
        H2
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => handleHeading(3)}
        className={buttonClass}
        aria-label="Заголовок 3 уровня"
      >
        H3
      </button>

      <div className={dividerClass} />

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => handleList(false)}
        className={buttonClass}
        aria-label="Ненумерованный список"
      >
        <UnoListIcon width={24} height={24} />
      </button>

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={() => handleList(true)}
        className={buttonClass}
        aria-label="Нумерованный список"
      >
        <OListIcon width={24} height={24} />
      </button>

      <div className={dividerClass} />

      <button
        type="button"
        onMouseDown={handleMouseDown}
        onClick={handleCodeBlock}
        className={buttonClass}
        aria-label="Блок кода"
      >
        {'</>'}
      </button>
    </div>
  );
});

export default EditorToolbar;
