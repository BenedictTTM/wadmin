'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Info, Plus, Trash2 } from 'lucide-react';
import type { QuestionOption } from '../../types/question';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

export interface OptionsBuilderProps {
  options: QuestionOption[];
  correctOption: string;
  onOptionsChange: (options: QuestionOption[]) => void;
  onCorrectOptionChange: (key: string) => void;
  error?: string;
  reviewValidationFailed?: boolean;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function OptionsBuilder({
  options,
  correctOption,
  onOptionsChange,
  onCorrectOptionChange,
  error,
  reviewValidationFailed = false,
}: OptionsBuilderProps): React.JSX.Element {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const showWarning = (msg: string) => {
    setWarningMessage(msg);
    setTimeout(() => setWarningMessage(null), 4000);
  };

  const handleTextChange = (index: number, text: string) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, text } : opt,
    );
    onOptionsChange(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 6) return;
    const nextKey = OPTION_KEYS[options.length];
    const updated = [...options, { key: nextKey, text: '' }];
    onOptionsChange(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const removedOption = options[index];
    const filtered = options.filter((_, i) => i !== index);

    // Re-key remaining options to sequential letters A, B, C...
    const reKeyed = filtered.map((opt, i) => ({
      ...opt,
      key: OPTION_KEYS[i],
    }));
    onOptionsChange(reKeyed);

    // If the removed option was marked correct, reset to Option A and warn
    if (removedOption.key === correctOption) {
      onCorrectOptionChange('A');
      showWarning(
        `Option ${removedOption.key} was marked correct; selection reset to Option A.`,
      );
    } else {
      // If an option after the removed one was correct, adjust the key to match new shifted key
      const correctIdx = options.findIndex((o) => o.key === correctOption);
      if (correctIdx > index) {
        onCorrectOptionChange(OPTION_KEYS[correctIdx - 1]);
      }
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Options & Correct Answer
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {options.length} / 6 Options
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Click an option badge to mark it as the correct answer. Exactly one option is correct.
          </p>
        </div>

        {options.length < 6 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="h-8 text-xs gap-1.5 border-slate-200 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Option</span>
          </Button>
        )}
      </div>

      {/* Warning Notice Banner */}
      {warningMessage && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800 animate-in fade-in">
          <Info className="h-4 w-4 shrink-0 text-amber-600" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Option Rows */}
      <div className="space-y-2.5">
        {options.map((option, index) => {
          const isCorrect = option.key === correctOption;
          const isOptionEmpty = !option.text.trim() && reviewValidationFailed;

          return (
            <div
              key={option.key}
              className={cn(
                'group flex items-center gap-3 rounded-lg border-2 border-[#141827] p-2.5 transition-all shadow-tactile-xs',
                isCorrect
                  ? 'bg-[#F6D86B]/25 ring-0'
                  : 'bg-white hover:bg-[#F8F5EF]',
                isOptionEmpty && 'border-rose-500 bg-rose-50/40',
              )}
            >
              {/* Option Key Badge Button (Click sets correctOption) */}
              <button
                type="button"
                onClick={() => onCorrectOptionChange(option.key)}
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-black text-xs transition-all border-2 border-[#141827]',
                  isCorrect
                    ? 'bg-[#F6D86B] text-[#141827] shadow-[0_1.5px_0_#141827] active:translate-y-0.5'
                    : 'bg-white text-[#141827] hover:bg-[#F6D86B]/50',
                )}
                title={`Click to set Option ${option.key} as the correct answer`}
                aria-pressed={isCorrect}
              >
                {isCorrect ? (
                  <Check className="h-4 w-4 stroke-[3]" />
                ) : (
                  <span>{option.key}</span>
                )}
              </button>

              {/* Text Input */}
              <div className="flex-1">
                <Input
                  type="text"
                  value={option.text}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  placeholder={`Enter Option ${option.key} text... (e.g. $2x + C$ or plain text)`}
                  className={cn(
                    'h-9 text-xs transition-colors',
                    isCorrect && 'border-[#141827] focus-visible:ring-[#F6D86B]',
                    isOptionEmpty && 'border-rose-500 focus-visible:ring-rose-500',
                  )}
                />
              </div>

              {/* Correct Indicator Chip */}
              {isCorrect && (
                <div className="hidden sm:flex items-center gap-1 rounded bg-[#141827] text-[#F6D86B] px-2 py-1 text-[10px] font-bold uppercase tracking-wide border border-[#141827]">
                  <Check className="h-3 w-3 stroke-[3]" />
                  <span>Correct Answer</span>
                </div>
              )}

              {/* Delete Option Button (allowed if > 2) */}
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveOption(index)}
                  className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title={`Remove Option ${option.key}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Errors */}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default OptionsBuilder;
