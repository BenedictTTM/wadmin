import React from 'react';
import { TypeMeta } from '../../constants/question';
import type { QuestionType } from '../../types/question';
import { cn } from '../../lib/utils';

export interface TypeBadgeProps {
  type: QuestionType;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps): React.JSX.Element {
  const meta = TypeMeta[type] || { label: type };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200',
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default TypeBadge;
