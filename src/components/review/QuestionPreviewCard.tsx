'use client';

import React from 'react';
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  HelpCircle,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react';
import type { Question } from '../../types/question';
import { StatusBadge } from '../ui/StatusBadge';
import { DifficultyBadge } from '../ui/DifficultyBadge';
import { TypeBadge } from '../ui/TypeBadge';
import { FlashCardIndicator } from '../ui/FlashCardIndicator';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

export interface QuestionPreviewCardProps {
  question: Question | null;
  isAdmin: boolean;
  onApprove: (id: string) => void;
  onRejectClick: (id: string) => void;
  isApproving?: boolean;
}

export function QuestionPreviewCard({
  question,
  isAdmin,
  onApprove,
  onRejectClick,
  isApproving = false,
}: QuestionPreviewCardProps): React.JSX.Element {
  if (!question) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-slate-50/50">
        <HelpCircle className="h-10 w-10 text-slate-300" />
        <h4 className="mt-2 text-sm font-semibold text-slate-700">
          No Question Selected
        </h4>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          Select a pending question from the queue on the left to review its content, options, and taxonomy.
        </p>
      </div>
    );
  }

  const subjectName = question.subtopic?.topic?.subject?.name;
  const topicName = question.subtopic?.topic?.name;
  const subtopicName = question.subtopic?.name;
  const taxonomyBreadcrumb = [subjectName, topicName, subtopicName]
    .filter(Boolean)
    .join(' › ');

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(question.createdAt));

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden bg-white">
      {/* Scrollable Preview Area */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header Metadata Row: Taxonomy Breadcrumb, Flashcard, Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Taxonomy
              </p>
              <p className="text-xs font-medium text-slate-700 mt-0.5">
                {taxonomyBreadcrumb || 'Uncategorized'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <FlashCardIndicator hasFlashCard={question.hasFlashCard} size="lg" />
              <TypeBadge type={question.type} />
              <DifficultyBadge difficulty={question.difficulty} />
              <StatusBadge status={question.status} />
            </div>
          </div>

          {/* Author Chip & Created Date */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium">{question.author?.name || 'Unknown Author'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Full Question Text */}
          <div className="rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-4 shadow-tactile-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question Text
            </h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#141827] whitespace-pre-wrap">
              {question.text}
            </p>
          </div>

          {/* Options List with highlighted correct option */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Answer Options
            </h4>
            <div className="space-y-2">
              {question.options?.map((option) => {
                const isCorrect = option.key === question.correctOption;
                return (
                  <div
                    key={option.key}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border-2 border-[#141827] p-3 text-xs transition-colors shadow-tactile-xs',
                      isCorrect
                        ? 'bg-[#F6D86B]/25 text-[#141827] font-medium'
                        : 'bg-white text-slate-700',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-[#141827] text-xs font-black',
                        isCorrect
                          ? 'bg-[#F6D86B] text-[#141827]'
                          : 'bg-slate-100 text-[#141827]',
                      )}
                    >
                      {option.key}
                    </div>
                    <div className="flex-1 pt-0.5 leading-relaxed font-medium">
                      {option.text}
                    </div>
                    {isCorrect && (
                      <div className="flex flex-shrink-0 items-center gap-1 bg-[#141827] text-[#F6D86B] px-1.5 py-0.5 rounded border border-[#141827] font-bold text-[10px]">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                        <span>Correct Answer</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation Callout Box */}
          {question.explanation && (
            <div className="rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-4 shadow-tactile-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Explanation & Rationale
              </h4>
              <p className="mt-1 text-xs text-[#141827] leading-relaxed whitespace-pre-wrap">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between border-t-2 border-[#141827] bg-[#F8F5EF] px-6 py-3.5 shadow-tactile-sm">
        {isAdmin ? (
          <div className="flex w-full items-center justify-between">
            <span className="text-xs font-bold text-[#141827]">
              Review action for Question <span className="font-mono bg-[#F6D86B] border border-[#141827] px-1.5 py-0.2 rounded">#{question.id.slice(0, 8)}</span>
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRejectClick(question.id)}
                disabled={isApproving}
                className="gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject ✗</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onApprove(question.id)}
                disabled={isApproving}
                className="gap-1.5 bg-[#F6D86B] hover:bg-[#F6D86B]/90 text-[#141827] font-bold border-2 border-[#141827] shadow-tactile active:translate-y-0.5 active:shadow-none"
              >
                <CheckCircle className="h-4 w-4 text-[#141827]" />
                <span>{isApproving ? 'Approving…' : 'Approve ✓'}</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 py-1.5 px-3 rounded border border-amber-200">
            <ShieldAlert className="h-4 w-4" />
            <span>Only admins can approve or reject questions.</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionPreviewCard;
