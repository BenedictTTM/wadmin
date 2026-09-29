'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Archive,
  ArrowUpDown,
  CheckCircle,
  Eye,
  FileQuestion,
  Filter,
  Loader2,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useQuestionsInfinite } from '../../hooks/useQuestions';
import { useQuestionMutations } from '../../hooks/useQuestionMutations';
import type { Question, QuestionDifficulty, QuestionStatus } from '../../types/question';
import { StatusBadge } from '../ui/StatusBadge';
import { DifficultyBadge } from '../ui/DifficultyBadge';
import { FlashCardIndicator } from '../ui/FlashCardIndicator';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type UserRole = 'ADMIN' | 'TEACHER' | 'CONTENT_DEVELOPER';

export interface QuestionListPanelProps {
  selectedSubtopicId: string | null;
  selectedSubjectId?: string | null;
  selectedTopicId?: string | null;
  subtopicName?: string;
  role?: UserRole;
  searchQuery?: string;
}

export function QuestionListPanel({
  selectedSubtopicId,
  selectedSubjectId,
  selectedTopicId,
  subtopicName,
  role = 'ADMIN',
  searchQuery,
}: QuestionListPanelProps): React.JSX.Element {
  const [rejectingQuestionId, setRejectingQuestionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuestionStatus>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | QuestionDifficulty>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'difficulty'>('newest');

  // Fetch infinite questions for this subtopic or search query
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useQuestionsInfinite({
    subtopicId: selectedSubtopicId || undefined,
    search: searchQuery || undefined,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
    difficulty: difficultyFilter === 'ALL' ? undefined : difficultyFilter,
    limit: 20,
  });

  const {
    submitForReviewMutation,
    approveMutation,
    rejectMutation,
    archiveMutation,
    deleteMutation,
  } = useQuestionMutations();

  // Flatten infinite query pages
  const rawQuestions: Question[] = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.total ?? rawQuestions.length;

  // Client-side sort
  const questions = useMemo(() => {
    const list = [...rawQuestions];
    if (sortBy === 'newest') {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
    } else if (sortBy === 'oldest') {
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      );
    } else if (sortBy === 'difficulty') {
      const weight: Record<QuestionDifficulty, number> = {
        EASY: 1,
        MEDIUM: 2,
        HARD: 3,
      };
      list.sort((a, b) => (weight[a.difficulty] || 0) - (weight[b.difficulty] || 0));
    }
    return list;
  }, [rawQuestions, sortBy]);

  const handleRejectSubmit = (id: string) => {
    if (!rejectReason.trim()) return;
    rejectMutation.mutate(
      { id, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectingQuestionId(null);
          setRejectReason('');
        },
      },
    );
  };

  if (!selectedSubtopicId && !searchQuery) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-50/50 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <FileQuestion className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-800">
          No Subtopic Selected
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Drill down through Subject, Topic, and Subtopic columns to inspect and manage questions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 min-w-[360px] md:min-w-[400px] flex-col overflow-hidden bg-white">
      {/* Panel Header */}
      <div className="flex h-12 items-center justify-between border-b-2 border-[#141827] px-3.5 sm:px-4 bg-[#F8F5EF] gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h2
            className="text-xs font-bold text-[#141827] truncate"
            title={
              searchQuery
                ? `Search: "${searchQuery}"`
                : `Subtopic: ${subtopicName || 'Questions'}`
            }
          >
            {searchQuery
              ? `Search: "${searchQuery}"`
              : `Subtopic: ${subtopicName || 'Questions'}`}
          </h2>
          {!isLoading && (
            <span className="shrink-0 rounded-full bg-white border border-[#141827] px-2 py-0.5 text-[11px] font-bold text-[#141827] whitespace-nowrap shadow-sm">
              ({totalCount})
            </span>
          )}
        </div>

        {/* Header Controls: Filter, Sort, New Question */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
              >
                <Filter className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {statusFilter !== 'ALL' || difficultyFilter !== 'ALL'
                    ? 'Filtered'
                    : 'Filter'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs p-1">
              <div className="px-2 py-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Status
              </div>
              {(['ALL', 'DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED'] as const).map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className={statusFilter === s ? 'font-semibold text-indigo-600' : 'text-slate-700'}>
                    {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
                  </span>
                  {statusFilter === s && <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <div className="px-2 py-1.5 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Difficulty
              </div>
              {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((d) => (
                <DropdownMenuItem
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className={difficultyFilter === d ? 'font-semibold text-indigo-600' : 'text-slate-700'}>
                    {d === 'ALL' ? 'All Difficulties' : d}
                  </span>
                  {difficultyFilter === d && <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs text-slate-700 border-slate-200 bg-white hover:bg-slate-50"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 text-xs p-1">
              {[
                { label: 'Newest First', value: 'newest' },
                { label: 'Oldest First', value: 'oldest' },
                { label: 'Difficulty', value: 'difficulty' },
              ].map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortBy(opt.value as any)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span className={sortBy === opt.value ? 'font-semibold text-indigo-600' : 'text-slate-700'}>
                    {opt.label}
                  </span>
                  {sortBy === opt.value && <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Question Button */}
          <Link
            href={
              selectedSubtopicId
                ? `/questions/new?subtopicId=${selectedSubtopicId}&topicId=${selectedTopicId || ''}&subjectId=${selectedSubjectId || ''}`
                : '/questions/new'
            }
          >
            <Button size="sm" className="h-8 gap-1.5 text-xs bg-[#F6D86B] hover:bg-[#F6D86B]/90 text-[#141827] font-bold border-2 border-[#141827] shadow-tactile-sm">
              <Plus className="h-3.5 w-3.5 text-[#141827]" />
              <span>New Question</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Questions ScrollArea List */}
      <ScrollArea className="flex-1 bg-slate-50/30">
        {isLoading ? (
          <div className="flex h-56 flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            <p className="text-xs text-slate-400">Loading questions...</p>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600">
            Failed to load questions. Please check your connection or backend status.
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileQuestion className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs text-slate-500 font-medium">
              No questions found matching the selected criteria.
            </p>
            <Link href="/questions/new" className="mt-3">
              <Button size="sm" variant="outline" className="text-xs">
                Create first question
              </Button>
            </Link>
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 space-y-2">
            {questions.map((question, index) => {
              const canEdit =
                role === 'ADMIN' ||
                question.status === 'DRAFT' ||
                question.status === 'REJECTED';
              const canSubmit =
                (role === 'ADMIN' || role === 'TEACHER' || role === 'CONTENT_DEVELOPER') &&
                (question.status === 'DRAFT' || question.status === 'REJECTED');
              const canApprove =
                role === 'ADMIN' && question.status === 'PENDING_REVIEW';
              const canReject =
                role === 'ADMIN' && question.status === 'PENDING_REVIEW';
              const canArchive =
                role === 'ADMIN' && question.status === 'PUBLISHED';
              const canDelete =
                role === 'ADMIN' || question.status === 'DRAFT';
              const isLockedInReview =
                question.status === 'PENDING_REVIEW' && role !== 'ADMIN';

              const authorLabel =
                question.author?.name ||
                (question.author?.email ? question.author.email.split('@')[0] : 'Curriculum Staff');

              return (
                <div
                  key={question.id}
                  className="rounded-lg border-2 border-[#141827] bg-white p-2.5 sm:p-3 shadow-tactile-sm hover:shadow-tactile hover:-translate-y-0.5 transition-all"
                >
                  {/* Top Row: Q# + Question Prompt + Badges */}
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap sm:flex-nowrap">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span className="shrink-0 inline-flex items-center justify-center bg-[#F6D86B] text-[#141827] border border-[#141827] px-1.5 py-0.5 rounded font-black text-[10px] shadow-[0_1px_0_#141827]">
                        Q{index + 1}
                      </span>
                      <Link
                        href={`/questions/${question.id}`}
                        className="text-xs font-bold text-[#141827] hover:underline decoration-[#F6D86B] decoration-2 transition-colors line-clamp-2 leading-snug"
                        title={question.text}
                      >
                        {question.text}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <DifficultyBadge difficulty={question.difficulty} />
                      <StatusBadge status={question.status} />
                      <FlashCardIndicator hasFlashCard={question.hasFlashCard} />
                    </div>
                  </div>

                  {/* Bottom Row: Author on left, Action Buttons on right */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs flex-wrap">
                    <div className="text-[11px] text-slate-500 font-medium truncate">
                      Author: <span className="text-slate-700 font-semibold">{authorLabel}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* View Button */}
                      <Link href={`/questions/${question.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[11px] text-slate-600 hover:text-indigo-600"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                      </Link>

                      {/* Edit Button */}
                      {canEdit && (
                        <Link href={`/questions/${question.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[11px] text-slate-600 hover:text-indigo-600"
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        </Link>
                      )}

                      {/* Submit For Review */}
                      {canSubmit && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={submitForReviewMutation.isPending}
                          onClick={() => submitForReviewMutation.mutate(question.id)}
                          className="h-6 px-2 text-[11px] text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                        >
                          <Send className="mr-1 h-3 w-3" />
                          Submit
                        </Button>
                      )}

                      {/* Locked in Review Badge */}
                      {isLockedInReview && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Lock className="h-3 w-3" />
                          Reviewing
                        </span>
                      )}

                      {/* Create Flashcard Action */}
                      {!question.hasFlashCard && (
                        <Link href={`/questions/${question.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[11px] text-amber-700 hover:bg-amber-50"
                          >
                            <Zap className="mr-1 h-3 w-3 text-amber-500" />
                            Flashcard
                          </Button>
                        </Link>
                      )}

                      {/* Overflow Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-slate-600"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 text-xs">
                          {canApprove && (
                            <DropdownMenuItem
                              onClick={() => approveMutation.mutate(question.id)}
                              className="text-emerald-600"
                            >
                              <CheckCircle className="mr-2 h-3.5 w-3.5" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {canReject && (
                            <DropdownMenuItem
                              onClick={() => setRejectingQuestionId(question.id)}
                              className="text-rose-600"
                            >
                              <XCircle className="mr-2 h-3.5 w-3.5" />
                              Reject...
                            </DropdownMenuItem>
                          )}
                          {canArchive && (
                            <DropdownMenuItem
                              onClick={() => archiveMutation.mutate(question.id)}
                              className="text-amber-600"
                            >
                              <Archive className="mr-2 h-3.5 w-3.5" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this question?')) {
                                    deleteMutation.mutate(question.id);
                                  }
                                }}
                                className="text-rose-600 focus:bg-rose-50"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination Banner */}
            <div className="mt-4 rounded-lg border-2 border-[#141827] bg-white p-3 text-center text-xs text-[#141827] shadow-tactile-sm flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold text-[#141827] text-[11px] shrink-0">
                Showing {questions.length} of {totalCount} questions
              </span>

              {hasNextPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="h-7 text-xs border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More (Cursor Pagination)'
                  )}
                </Button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  All questions loaded
                </span>
              )}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Quick Reject Modal Prompt if open */}
      {rejectingQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">
              Reject Question
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Please provide feedback explaining why this question cannot be approved.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain what needs to be changed…"
              rows={3}
              className="mt-3 w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingQuestionId(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={rejectReason.trim().length < 5 || rejectMutation.isPending}
                onClick={() => handleRejectSubmit(rejectingQuestionId)}
              >
                {rejectMutation.isPending ? 'Rejecting…' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionListPanel;
