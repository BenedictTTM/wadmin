import React from 'react';
import { DifficultyMeta } from '../../constants/question';
import type { QuestionDifficulty } from '../../types/question';
import { cn } from '../../lib/utils';

export interface DifficultyBadgeProps {
  difficulty: QuestionDifficulty;
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps): React.JSX.Element {
  const meta = DifficultyMeta[difficulty] || {
    label: difficulty,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold border-2 border-[#141827] shadow-[0_1.5px_0_#141827] uppercase tracking-wider',
        meta.color,
        meta.bg,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

export default DifficultyBadge;
