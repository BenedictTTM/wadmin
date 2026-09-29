'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '../../lib/utils';

export interface MathMarkdownProps {
  content?: string;
  className?: string;
  placeholder?: string;
}

export function MathMarkdown({
  content = '',
  className,
  placeholder = 'Nothing to preview. Enter markdown or LaTeX equations.',
}: MathMarkdownProps): React.JSX.Element {
  if (!content || !content.trim()) {
    return (
      <div className="flex h-full min-h-[90px] items-center justify-center p-4 text-xs italic text-slate-400 bg-slate-50/50 rounded-md border border-dashed border-slate-200">
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none text-slate-800 leading-relaxed overflow-x-auto font-sans',
        '[&_.katex-display]:my-3 [&_.katex-display]:overflow-x-auto [&_.katex-display]:py-1 text-xs',
        '[&_.katex]:text-sm',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MathMarkdown;
