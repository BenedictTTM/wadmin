'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useQuestions } from '../../hooks/useQuestions';
import type { Question } from '../../types/question';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

export interface PendingListProps {
  questions?: Question[];
  isLoading?: boolean;
  selectedQuestionId: string | null;
  onSelectQuestion: (question: Question) => void;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInSeconds / 60);
    if (diffInHours < 24)
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  } catch {
    return 'recently';
  }
}

function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PendingList({
  questions: propQuestions,
  isLoading: propIsLoading,
  selectedQuestionId,
  onSelectQuestion,
}: PendingListProps): React.JSX.Element {
  const shouldFetch = propQuestions === undefined;
  const defaultFilters = React.useMemo(
    () => ({ status: 'PENDING_REVIEW' as const, limit: 50 }),
    [],
  );

  const queryResult = useQuestions(defaultFilters, { enabled: shouldFetch });

  const questions = propQuestions !== undefined ? propQuestions : queryResult.questions;
  const isLoading = propIsLoading !== undefined ? propIsLoading : queryResult.isLoading;

  return (
    <div className="flex h-full w-full flex-col bg-[#F8F5EF]">
      {/* List Header */}
      <div className="flex h-11 items-center justify-between border-b-2 border-[#141827] px-4 bg-[#F0EBE0]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#141827]">
          Pending Review
        </h3>
        <span className="rounded-full bg-[#F6D86B] border border-[#141827] px-2 py-0.5 text-[11px] font-bold text-[#141827]">
          {questions.length}
        </span>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#141827]" />
          </div>
        ) : questions.length === 0 ? (
          /* Empty state: Queue is clear ✓ with green check illustration */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6D86B] text-[#141827] border-2 border-[#141827] shadow-tactile-sm">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h4 className="mt-3 text-sm font-bold text-[#141827]">
              Queue is clear ✓
            </h4>
            <p className="mt-1 text-xs text-slate-500">
              No questions waiting for review at this time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#141827]/10">
            {questions.map((question) => {
              const isSelected = question.id === selectedQuestionId;
              const authorName = question.author?.name || 'Unknown Author';
              const initials = getInitials(authorName);
              const subtopicName = question.subtopic?.name || 'General';
              const topicName = question.subtopic?.topic?.name;
              const subjectName = question.subtopic?.topic?.subject?.name;

              // Subtopic > Topic > Subject
              const taxonomyBreadcrumb = [subtopicName, topicName, subjectName]
                .filter(Boolean)
                .join(' › ');

              const truncatedText =
                question.text.length > 60
                  ? `${question.text.slice(0, 60)}…`
                  : question.text;

              return (
                <button
                  key={question.id}
                  onClick={() => onSelectQuestion(question)}
                  className={cn(
                    'group flex w-full flex-col gap-1.5 p-3.5 text-left transition-colors',
                    isSelected
                      ? 'border-l-4 border-[#141827] bg-[#F6D86B] text-[#141827]'
                      : 'border-l-4 border-transparent hover:bg-white text-slate-800',
                  )}
                >
                  {/* Author Name + Avatar Initials + Relative Time */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#141827] text-[10px] font-black text-[#F6D86B]">
                        {initials}
                      </div>
                      <span className="font-bold text-[#141827]">
                        {authorName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {formatRelativeTime(question.createdAt)}
                    </span>
                  </div>

                  {/* Truncated Question Text (60 chars) */}
                  <p className="line-clamp-2 text-xs font-semibold text-[#141827]">
                    {truncatedText}
                  </p>

                  {/* Subtopic > Topic > Subject (breadcrumb, smallest text) */}
                  <p className="truncate text-[10px] text-slate-500">
                    {taxonomyBreadcrumb}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default PendingList;
