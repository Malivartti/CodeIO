import { makeAutoObservable } from 'mobx';

class TaskEditorStore {
  content = '';
  editorRef: HTMLDivElement | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setEditorRef = (ref: HTMLDivElement | null) => {
    this.editorRef = ref;
  };

  setContent = (content: string) => {
    this.content = content;
  };

  toggleBold = () => {
    this.toggleInlineFormat('strong');
  };

  toggleItalic = () => {
    this.toggleInlineFormat('em');
  };

  private toggleInlineFormat = (tagName: 'strong' | 'em') => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !this.editorRef) return;

    const range = selection.getRangeAt(0);

    const existingTag = this.findParentTag(range.commonAncestorContainer, tagName);

    if (existingTag) {
      if (range.collapsed) {
        this.endFormatting(range, existingTag);
      } else {
        this.removeFormattingFromSelection(range, existingTag, tagName);
      }
    } else if (range.collapsed) {
      this.insertEmptyTag(range, tagName);
    } else {
      this.wrapSelection(range, tagName);
    }

    this.updateContent();
    this.focusEditor();
  };

  private findParentTag = (node: Node, tagName: string): Element | null => {
    let current = node;

    while (current && current !== this.editorRef) {
      if (current.nodeType === Node.ELEMENT_NODE) {
        const element = current as Element;
        if (element.tagName.toLowerCase() === tagName) {
          return element;
        }
      }
      current = current.parentNode!;
    }

    return null;
  };

  private endFormatting = (range: Range, tag: Element) => {
    const textNode = document.createTextNode('\u200B');

    if (tag.nextSibling) {
      tag.parentNode?.insertBefore(textNode, tag.nextSibling);
    } else {
      tag.parentNode?.appendChild(textNode);
    }

    const newRange = document.createRange();
    newRange.setStart(textNode, 1);
    newRange.collapse(true);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  private removeFormattingFromSelection = (range: Range, tag: Element, tagName: string) => {
    try {
      const selectedText = range.toString();
      const tagContent = tag.textContent || '';

      const beforeSelection = tagContent.substring(0, tagContent.indexOf(selectedText));
      const afterSelection = tagContent.substring(tagContent.indexOf(selectedText) + selectedText.length);

      const parent = tag.parentNode;
      if (!parent) return;

      const fragment = document.createDocumentFragment();

      if (beforeSelection) {
        const beforeTag = document.createElement(tagName);
        beforeTag.textContent = beforeSelection;
        fragment.appendChild(beforeTag);
      }

      if (selectedText) {
        const textNode = document.createTextNode(selectedText);
        fragment.appendChild(textNode);
      }

      if (afterSelection) {
        const afterTag = document.createElement(tagName);
        afterTag.textContent = afterSelection;
        fragment.appendChild(afterTag);
      }

      parent.replaceChild(fragment, tag);

      const newRange = document.createRange();
      let textNodeToSelect = fragment.childNodes[beforeSelection ? 1 : 0];

      if (textNodeToSelect && textNodeToSelect.nodeType === Node.TEXT_NODE) {
        newRange.setStart(textNodeToSelect, selectedText.length);
        newRange.collapse(true);

        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    } catch {
      this.unwrapTag(tag);
    }
  };

  private insertEmptyTag = (range: Range, tagName: string) => {
    const tag = document.createElement(tagName);
    tag.textContent = '\u200B';

    range.insertNode(tag);

    const newRange = document.createRange();
    newRange.setStart(tag.firstChild!, 1);
    newRange.collapse(true);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  private wrapSelection = (range: Range, tagName: string) => {
    const tag = document.createElement(tagName);

    try {
      const contents = range.extractContents();
      tag.appendChild(contents);
      range.insertNode(tag);

      const newRange = document.createRange();
      newRange.selectNodeContents(tag);

      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } catch {
      // ignore
    }
  };

  private unwrapTag = (tag: Element) => {
    const parent = tag.parentNode;
    if (!parent) return;

    while (tag.firstChild) {
      parent.insertBefore(tag.firstChild, tag);
    }

    parent.removeChild(tag);
  };

  insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !this.editorRef) return;

    const range = selection.getRangeAt(0);
    const headingTag = `h${level}`;

    let currentBlock = this.getCurrentBlock(range);

    if (currentBlock) {
      const heading = document.createElement(headingTag);
      const textContent = currentBlock.textContent || 'Заголовок';
      heading.textContent = textContent;

      currentBlock.parentNode?.replaceChild(heading, currentBlock);
      this.setCursorToEnd(heading);
    } else {
      const heading = document.createElement(headingTag);
      const selectedText = range.toString() || 'Заголовок';
      heading.textContent = selectedText;

      range.deleteContents();
      range.insertNode(heading);
      this.setCursorToEnd(heading);
    }

    this.updateContent();
    this.focusEditor();
  };

  insertList = (ordered = false) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !this.editorRef) return;

    const range = selection.getRangeAt(0);
    const listTag = ordered ? 'ol' : 'ul';

    let currentBlock = this.getCurrentBlock(range);

    const list = document.createElement(listTag);
    const listItem = document.createElement('li');

    if (currentBlock && currentBlock.textContent?.trim()) {
      listItem.textContent = currentBlock.textContent.trim();
      list.appendChild(listItem);
      currentBlock.parentNode?.replaceChild(list, currentBlock);
    } else {
      const selectedText = range.toString() || 'Пункт списка';
      listItem.textContent = selectedText;
      list.appendChild(listItem);

      if (currentBlock) {
        currentBlock.parentNode?.replaceChild(list, currentBlock);
      } else {
        range.deleteContents();
        range.insertNode(list);
      }
    }

    this.setCursorToEnd(listItem);
    this.updateContent();
    this.focusEditor();
  };

  insertCodeBlock = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !this.editorRef) return;

    const range = selection.getRangeAt(0);
    const currentBlock = this.getCurrentBlock(range);

    const pre = document.createElement('pre');
    const code = document.createElement('code');

    if (currentBlock && currentBlock.textContent?.trim()) {
      code.textContent = currentBlock.textContent.trim();
      pre.appendChild(code);
      currentBlock.parentNode?.replaceChild(pre, currentBlock);
    } else {
      const selectedText = range.toString() || 'Код';
      code.textContent = selectedText;
      pre.appendChild(code);

      range.deleteContents();
      range.insertNode(pre);
    }

    this.setCursorToEnd(code);
    this.updateContent();
    this.focusEditor();
  };

  private getCurrentBlock = (range: Range): Element | null => {
    let node: Node | null = range.commonAncestorContainer;

    if (node?.nodeType === Node.TEXT_NODE) {
      node = node.parentNode!;
    }

    while (node && node !== this.editorRef) {
      const element = node as Element;
      const tagName = element.tagName?.toLowerCase();

      if (tagName && (
        tagName.match(/^h[1-6]$/) ||
        tagName === 'p' ||
        tagName === 'div' ||
        tagName === 'li' ||
        tagName === 'pre'
      )) {
        return element;
      }

      node = node?.parentNode;
    }

    return null;
  };

  private setCursorToEnd = (element: Element) => {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  private focusEditor = () => {
    if (this.editorRef) {
      this.editorRef.focus();
    }
  };

  private updateContent = () => {
    if (this.editorRef) {
      this.content = this.editorRef.innerHTML;
    }
  };

  getMarkdown = (): string => {
    if (!this.editorRef) return '';

    let markdown = '';
    const nodes = Array.from(this.editorRef.childNodes);

    nodes.forEach(node => {
      markdown += this.nodeToMarkdown(node);
    });

    return markdown.trim();
  };

  private nodeToMarkdown = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent || '';

      switch (tagName) {
        case 'h1':
          return `# ${textContent}\n\n`;
        case 'h2':
          return `## ${textContent}\n\n`;
        case 'h3':
          return `### ${textContent}\n\n`;
        case 'strong':
        case 'b':
          return `**${textContent}**`;
        case 'em':
        case 'i':
          return `*${textContent}*`;
        case 'pre':
        { const codeContent = element.querySelector('code')?.textContent || textContent;
          return `\`\`\`\n${codeContent}\n\`\`\`\n\n`; }
        case 'ol':
        { let orderedList = '';
          Array.from(element.children).forEach((li, index) => {
            orderedList += `${index + 1}. ${li.textContent}\n`;
          });
          return orderedList + '\n'; }
        case 'ul':
        { let unorderedList = '';
          Array.from(element.children).forEach(li => {
            unorderedList += `- ${li.textContent}\n`;
          });
          return unorderedList + '\n'; }
        case 'br':
          return '\n';
        case 'div':
        case 'p':
        { let content = '';
          Array.from(node.childNodes).forEach(child => {
            content += this.nodeToMarkdown(child);
          });
          return content + '\n\n'; }
        default:
        { let defaultContent = '';
          Array.from(node.childNodes).forEach(child => {
            defaultContent += this.nodeToMarkdown(child);
          });
          return defaultContent; }
      }
    }

    return '';
  };
}

export const taskEditorStore = new TaskEditorStore();
