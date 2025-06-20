
export const markdownToHTML = (markdown: string): string => {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  let html = '';
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s/, '').trim();
      html += `<h${level}>${parseInlineMarkdown(text)}</h${level}>`;
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;

      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }

      if (i < lines.length) i++;

      const codeContent = codeLines.join('\n');
      html += `<pre><code>${escapeHtml(codeContent)}</code></pre>`;
      continue;
    }

    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];

      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, '');
        listItems.push(`<li>${parseInlineMarkdown(itemText)}</li>`);
        i++;
      }

      html += `<ol>${listItems.join('')}</ol>`;
      continue;
    }

    if (line.match(/^[-*+]\s/)) {
      const listItems: string[] = [];

      while (i < lines.length && lines[i].trim().match(/^[-*+]\s/)) {
        const itemText = lines[i].trim().replace(/^[-*+]\s/, '');
        listItems.push(`<li>${parseInlineMarkdown(itemText)}</li>`);
        i++;
      }

      html += `<ul>${listItems.join('')}</ul>`;
      continue;
    }

    const paragraphLines: string[] = [];

    while (i < lines.length && lines[i].trim() &&
             !lines[i].trim().match(/^#{1,6}\s/) &&
             !lines[i].trim().startsWith('```') &&
             !lines[i].trim().match(/^\d+\.\s/) &&
             !lines[i].trim().match(/^[-*+]\s/)) {
      paragraphLines.push(lines[i].trim());
      i++;
    }

    if (paragraphLines.length > 0) {
      const paragraphText = paragraphLines.join(' ');
      html += `<div>${parseInlineMarkdown(paragraphText)}</div>`;
    }
  }

  return html;
};

const parseInlineMarkdown = (text: string): string => {
  let result = text;

  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.*?)__/g, '<strong>$1</strong>');

  result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.*?)_/g, '<em>$1</em>');

  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  return result;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
