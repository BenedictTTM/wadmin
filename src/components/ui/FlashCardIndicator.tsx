'use client';

import React from 'react';
import { Minus, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { cn } from '../../lib/utils';

export interface FlashCardIndicatorProps {
  hasFlashCard: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

export function FlashCardIndicator({
  hasFlashCard,
  size = 'sm',
  className,
}: FlashCardIndicatorProps): React.JSX.Element {
  const tooltipText = hasFlashCard ? 'Flash card linked' : 'No flash card';

  if (size === 'lg') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset',
          hasFlashCard
            ? 'bg-teal-50 text-teal-700 ring-teal-600/20'
            : 'bg-slate-50 text-slate-500 ring-slate-200',
          className,
        )}
      >
        {hasFlashCard ? (
          <Zap className="h-3.5 w-3.5 fill-teal-600 text-teal-600" />
        ) : (
          <Minus className="h-3.5 w-3.5 text-slate-400" />
        )}
        <span>{tooltipText}</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center justify-center p-1 rounded transition-colors',
              hasFlashCard
                ? 'text-teal-600 hover:bg-teal-50'
                : 'text-slate-300 hover:bg-slate-100',
              className,
            )}
            aria-label={tooltipText}
          >
            {hasFlashCard ? (
              <Zap className="h-4 w-4 fill-teal-600 text-teal-600" />
            ) : (
              <Minus className="h-4 w-4 text-slate-300" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default FlashCardIndicator;
