import { markdownToHTML } from '@shared/lib/converters';
import { observer } from 'mobx-react-lite';
import React, { FC, useEffect, useRef } from 'react';

import { taskEditorStore } from '../model/store';
import EditorToolbar from './EditorToolbar';

interface Props {
  className?: string;
  placeholder?: string;
  onContentChange?: (markdown: string) => void;
  initialContent?: string;
}

const TaskEditor: FC<Props> = observer(({
  className,
  placeholder = 'Введите описание задачи...',
  onContentChange,
  initialContent = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      taskEditorStore.setEditorRef(editorRef.current);

      if (initialContent && editorRef.current.innerHTML === '') {
        const htmlContent = markdownToHTML(initialContent);
        editorRef.current.innerHTML = htmlContent;
        taskEditorStore.setContent(initialContent);
      }
    }
  }, [initialContent]);

  const handleInput = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      let shouldRestoreCursor = true;
      let savedRange = selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;

      const directTextNodes = Array.from(editorRef.current.childNodes).filter(
        node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
      );

      if (directTextNodes.length > 0) {
        let targetDiv: HTMLDivElement | null = null;

        directTextNodes.forEach(textNode => {
          const div = document.createElement('div');
          div.textContent = textNode.textContent || '';
          editorRef.current!.replaceChild(div, textNode);

          if (savedRange && savedRange.startContainer === textNode) {
            targetDiv = div;
          }
        });

        const divForCursor = targetDiv || editorRef.current.querySelector('div') as HTMLDivElement;

        if (divForCursor && selection) {
          const newRange = document.createRange();

          if (divForCursor.firstChild && divForCursor.firstChild.nodeType === Node.TEXT_NODE) {
            const textContent = divForCursor.firstChild.textContent || '';
            newRange.setStart(divForCursor.firstChild, textContent.length);
          } else {
            newRange.selectNodeContents(divForCursor);
            newRange.collapse(false);
          }

          try {
            selection.removeAllRanges();
            selection.addRange(newRange);
          } catch {
            const fallbackRange = document.createRange();
            fallbackRange.selectNodeContents(divForCursor);
            fallbackRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(fallbackRange);
          }
        }

        shouldRestoreCursor = false;
      }

      taskEditorStore.setContent(editorRef.current.innerHTML);

      if (shouldRestoreCursor && savedRange && selection) {
        try {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        } catch {
        // ignore
        }
      }

      if (onContentChange) {
        const markdown = taskEditorStore.getMarkdown();
        onContentChange(markdown);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          taskEditorStore.toggleBold();
          break;
        case 'i':
          e.preventDefault();
          taskEditorStore.toggleItalic();
          break;
      }
    }

    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const range = selection.getRangeAt(0);

      if (range.commonAncestorContainer === editorRef.current) {
        e.preventDefault();

        const newDiv = document.createElement('div');
        newDiv.innerHTML = '<br>';

        const currentNode = range.startContainer;
        if (currentNode.nodeType === Node.TEXT_NODE) {
          const parent = currentNode.parentNode;
          if (parent === editorRef.current) {
            const currentDiv = document.createElement('div');
            currentDiv.textContent = currentNode.textContent || '';
            parent.replaceChild(currentDiv, currentNode);

            parent.insertBefore(newDiv, currentDiv.nextSibling);

            const newRange = document.createRange();
            newRange.setStart(newDiv, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);

            return;
          }
        }
      }

      let node: Node | null = range.commonAncestorContainer;

      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName && element.tagName.toLowerCase() === 'pre') {
            e.preventDefault();

            const codeElement = element.querySelector('code');
            if (!codeElement) return;

            const text = codeElement.textContent || '';

            let cursorPosition = 0;
            const walker = document.createTreeWalker(
              codeElement,
              NodeFilter.SHOW_TEXT,
              null
            );

            let currentNode = walker.nextNode();
            while (currentNode && currentNode !== range.startContainer) {
              cursorPosition += currentNode.textContent?.length || 0;
              currentNode = walker.nextNode();
            }

            if (currentNode === range.startContainer) {
              cursorPosition += range.startOffset;
            }

            const beforeCursor = text.slice(0, cursorPosition);
            const afterCursor = text.slice(cursorPosition);

            if (beforeCursor.endsWith('\n') && (beforeCursor.slice(-2) === '\n\n' || beforeCursor === '\n')) {
              const cleanedBefore = beforeCursor.replace(/\n+$/, '');
              codeElement.textContent = cleanedBefore + afterCursor;

              const newDiv = document.createElement('div');
              newDiv.innerHTML = '<br>';
              element.parentNode?.insertBefore(newDiv, element.nextSibling);

              const newRange = document.createRange();
              newRange.setStart(newDiv, 0);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              const newText = beforeCursor + '\n' + afterCursor;
              codeElement.textContent = newText;

              const newCursorPosition = beforeCursor.length + 1;

              const textNode = codeElement.firstChild;
              if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const newRange = document.createRange();
                newRange.setStart(textNode, Math.min(newCursorPosition, textNode.textContent?.length || 0));
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            }

            taskEditorStore.setContent(editorRef.current?.innerHTML || '');

            if (onContentChange) {
              const markdown = taskEditorStore.getMarkdown();
              onContentChange(markdown);
            }

            return;
          }
        }
        node = node.parentNode;
      }

      let parentElement = range.commonAncestorContainer.parentElement;

      while (parentElement && parentElement !== editorRef.current) {
        if (parentElement.tagName && parentElement.tagName.toLowerCase().match(/^h[1-6]$/)) {
          e.preventDefault();

          const newDiv = document.createElement('div');
          newDiv.innerHTML = '<br>';

          parentElement.parentNode?.insertBefore(newDiv, parentElement.nextSibling);

          const newRange = document.createRange();
          newRange.setStart(newDiv, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);

          break;
        }
        parentElement = parentElement.parentElement;
      }
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden bg-[var(--background-color-canvas)] border border-[var(--border-color-surface)] ${className}`}>
      <EditorToolbar />

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-label={placeholder}
        className="min-h-[200px] p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-surface-accent)] focus-visible:ring-offset-2 prose prose-amber max-w-none text-[var(--color-strong)] placeholder:text-[var(--color-subtle)]"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
});

export default TaskEditor;
