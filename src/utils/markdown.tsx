import React from 'react';

/**
 * Requirement A.1: Render markdown cleanly without any raw asterisks.
 * Handles bold (**text**), italics (*text*), bullets (•, -, *), and headers.
 */
interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');

  return (
    <div className={`space-y-1.5 leading-relaxed ${className}`}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        // Empty line spacer
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Heading 3: ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="font-bold text-gray-900 text-sm mt-2 mb-0.5 font-display">
              {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        // Heading 2: ##
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lineIdx} className="font-bold text-gray-900 text-base mt-2.5 mb-1 font-display">
              {renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }

        // Heading 1: #
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={lineIdx} className="font-extrabold text-gray-900 text-lg mt-3 mb-1 font-display">
              {renderInlineMarkdown(trimmed.replace(/^#\s+/, ''))}
            </h2>
          );
        }

        // Bullet point: starts with "• ", "* ", or "- "
        if (/^([•\-\*]|\d+\.)\s+/.test(trimmed)) {
          const bulletText = trimmed.replace(/^([•\-\*]|\d+\.)\s+/, '');
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 my-0.5 text-xs sm:text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E6BFF] mt-1.5 shrink-0" />
              <div className="flex-1 text-gray-800">
                {renderInlineMarkdown(bulletText)}
              </div>
            </div>
          );
        }

        // Standard line
        return (
          <p key={lineIdx} className="text-xs sm:text-sm text-gray-800">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Parse bold (**text**), italic (*text*), and strip any remaining lone asterisks.
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Tokens: we break by bold (**...**) first, then italic (*...*)
  const elements: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  // Regex to match **bold** or *italic*
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = remaining.split(pattern);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldContent = part.slice(2, -2);
      elements.push(
        <strong key={`b-${keyCounter++}`} className="font-bold text-gray-950">
          {cleanRemainingAsterisks(boldContent)}
        </strong>
      );
    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      const italicContent = part.slice(1, -1);
      elements.push(
        <em key={`i-${keyCounter++}`} className="italic text-gray-700">
          {cleanRemainingAsterisks(italicContent)}
        </em>
      );
    } else {
      // Normal plain text: clean any stray orphaned asterisks
      elements.push(
        <span key={`t-${keyCounter++}`}>
          {cleanRemainingAsterisks(part)}
        </span>
      );
    }
  }

  return elements;
}

/**
 * Remove any leftover raw asterisks so none appear in customer view
 */
function cleanRemainingAsterisks(text: string): string {
  return text.replace(/\*/g, '');
}
