'use client';

/**
 * Simple markdown-to-JSX renderer.
 * Supports: **bold**, *italic*, `code`, ### headers, - lists, line breaks
 */
export default function Markdown({ text }) {
  if (!text) return null;

  const nodes = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading ### or ## or #
    if (/^#{1,4}\s/.test(line)) {
      const level = line.match(/^(#{1,4})/)[1].length;
      const content = line.replace(/^#{1,4}\s+/, '');
      const sizes = { 1: 'text-lg', 2: 'text-base', 3: 'text-sm', 4: 'text-xs' };
      nodes.push(
        <p key={i} className={`${sizes[level] || 'text-sm'} font-bold text-white mt-2 mb-1`}>
          {parseInline(content)}
        </p>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^[-*]\s+/, '')));
        i++;
      }
      nodes.push(
        <ul key={i} className="mt-1 mb-1 space-y-0.5">
          {items.map((item, j) => (
            <li key={j} className="text-sm text-white flex items-start gap-2">
              <span className="text-[#6366F1] mt-1 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const num = lines[i].match(/^(\d+)/)[1];
        items.push({ num, content: parseInline(lines[i].replace(/^\d+\.\s+/, '')) });
        i++;
      }
      nodes.push(
        <ol key={i} className="mt-1 mb-1 space-y-0.5">
          {items.map((item, j) => (
            <li key={j} className="text-sm text-white flex items-start gap-2">
              <span className="text-[#6366F1] font-medium shrink-0">{item.num}.</span>
              <span>{item.content}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Code block (fenced)
    if (line.startsWith('```')) {
      i++;
      const codeLines = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      nodes.push(
        <pre key={i} className="bg-[#0F0F0F] rounded-lg p-3 my-1 overflow-x-auto">
          <code className="text-xs text-[#10B981] font-mono whitespace-pre-wrap">
            {codeLines.join('\n')}
          </code>
        </pre>
      );
      continue;
    }

    // Inline code
    if (line.includes('`')) {
      const parts = line.split(/(`[^`]+`)/g);
      nodes.push(
        <p key={i} className="text-sm text-white leading-relaxed">
          {parts.map((part, j) =>
            part.startsWith('`') ? (
              <code key={j} className="bg-[#0F0F0F] text-[#10B981] px-1 py-0.5 rounded text-xs font-mono">
                {part.slice(1, -1)}
              </code>
            ) : (
              <span key={j}>{parseInline(part)}</span>
            )
          )}
        </p>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      nodes.push(<hr key={i} className="border-[#303030] my-2" />);
      i++;
      continue;
    }

    // Regular paragraph (or blank line)
    if (line.trim()) {
      nodes.push(
        <p key={i} className="text-sm text-white leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
    i++;
  }

  return <>{nodes}</>;
}

/** Parse inline bold, italic, and links */
function parseInline(text) {
  // **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  let result = [];
  let key = 0;

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      result.push(
        <strong key={key++} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      result.push(
        <em key={key++} className="italic text-[#AAAAAA]">
          {part.slice(1, -1)}
        </em>
      );
    } else {
      result.push(<span key={key++}>{part}</span>);
    }
  }

  return result;
}
