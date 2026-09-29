'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Archive,
  ArrowLeft,
  Check,
  CheckCircle,
  Clock,
  HelpCircle,
  Loader2,
  Lock,
  Pencil,
  Send,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react';
import { useQuestion } from '../../../../hooks/useQuestion';
import { useQuestionMutations } from '../../../../hooks/useQuestionMutations';
import { usePermissions } from '../../../../hooks/usePermissions';
import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { DifficultyBadge } from '../../../../components/ui/DifficultyBadge';
import { FlashCardIndicator } from '../../../../components/ui/FlashCardIndicator';
import { Button } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';

import { ReviewQuestionModal } from '../../../../components/review/ReviewQuestionModal';

export default function QuestionDetailPage(): React.JSX.Element {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : null;


  const { data: question, isLoading, isError } = useQuestion(id);

  const {
    submitForReviewMutation,
    approveMutation,
    rejectMutation,
    archiveMutation,
    deleteMutation,
  } = useQuestionMutations({
    onError: (err) => {
      alert(`Action failed: ${err.message}`);
    },
  });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#F5F1E8]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#141827]" />
          <p className="text-xs text-[#141827] font-bold">Loading question details...</p>
        </div>
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-[#F5F1E8]">
        <div className="rounded-xl border-3 border-[#141827] bg-white p-8 shadow-tactile-xl max-w-md w-full flex flex-col items-center">
          <HelpCircle className="h-12 w-12 text-[#141827] mb-3" />
          <h3 className="text-lg font-black text-[#141827]">
            Question Not Found
          </h3>
          <p className="mt-1 text-xs text-slate-600 mb-5 max-w-sm">
            The requested question could not be located or has been deleted.
          </p>
          <Link href="/questions">
            <Button variant="outline" size="sm" className="bg-[#F6D86B] hover:bg-[#F6D86B]/90 text-[#141827] font-bold border-2 border-[#141827] shadow-tactile-sm">
              Back to Question Bank
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subjectName = question.subtopic?.topic?.subject?.name || 'Mathematics';
  const topicName = question.subtopic?.topic?.name || 'Calculus';
  const subtopicName = question.subtopic?.name || 'Integration by Parts';

  const taxonomyPath = `${subjectName} > ${topicName} > ${subtopicName}`;

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this question?')) {
      deleteMutation.mutate(question.id, {
        onSuccess: () => {
          router.push('/questions');
        },
      });
    }
  };

  // ── Permissions (derived from role + ownership + status) ──────────────
  const perms = usePermissions(question);
  const { isAdmin, canEditQuestion, canDeleteQuestion, canSubmitForReview, canApprove, canReject, canArchive } = perms;

  // Show the author action bar when the user has at least one non-admin action
  const showAuthorBar = canEditQuestion || canDeleteQuestion || canSubmitForReview;

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#F5F1E8] p-6 font-sans">
      {/* Back button & Title Bar */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-xs text-[#141827] hover:text-[#141827] bg-white border-2 border-[#141827] shadow-tactile-sm font-bold"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Question Bank</span>
        </Button>

        <span className="font-mono text-xs font-bold text-[#141827] bg-[#F8F5EF] border border-[#141827] px-2 py-0.5 rounded">
          ID: {question.id}
        </span>
      </div>

      {/* Main Neo-Brutalist Question Container Card */}
      <div className="rounded-xl border-3 border-[#141827] bg-white p-6 shadow-tactile-xl max-w-5xl mx-auto w-full space-y-6">
        {/* Question Text */}
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-[#141827] bg-[#F6D86B] inline-block px-2 py-0.5 rounded border border-[#141827]">
            Question
          </p>
          <h1 className="text-base font-bold text-[#141827] leading-relaxed whitespace-pre-wrap mt-2">
            Q: {question.text}
          </h1>
        </div>

        {/* Options Grid */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Options</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options?.map((option) => {
              const isCorrect = option.key === question.correctOption;
              return (
                <div
                  key={option.key}
                  className={cn(
                    'flex items-start justify-between gap-3 rounded-lg border-2 border-[#141827] p-3 text-xs transition-all shadow-tactile-xs',
                    isCorrect
                      ? 'bg-[#F6D86B]/30 text-[#141827] font-semibold'
                      : 'bg-white text-slate-700',
                  )}
                >
                  <div className="flex items-start gap-2 flex-1">
                    <span className="font-black text-[#141827]">({option.key})</span>
                    <span className="leading-relaxed font-medium">{option.text}</span>
                  </div>

                  {isCorrect && (
                    <span className="rounded bg-[#141827] px-1.5 py-0.5 text-[10px] font-bold text-[#F6D86B] tracking-wide shrink-0 border border-[#141827]">
                      [CORRECT]
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-4 shadow-tactile-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
            Explanation
          </h4>
          <p className="text-xs text-[#141827] leading-relaxed whitespace-pre-wrap font-medium">
            {question.explanation || 'By standard integration principles and rules.'}
          </p>
        </div>

        {/* Horizontal Separator */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          {/* Taxonomy row */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500 min-w-[70px]">Taxonomy:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {taxonomyPath}
            </span>
          </div>

          {/* Badges row */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-bold text-slate-500 min-w-[70px]">Badges:</span>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={question.difficulty} />
              <StatusBadge status={question.status} />
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border',
                  question.hasFlashCard
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500',
                )}
              >
                <Zap className={cn('h-3 w-3', question.hasFlashCard ? 'text-amber-500 fill-amber-500' : 'text-slate-400')} />
                {question.hasFlashCard ? '⚡ Flashcard: Active' : '○ No Flashcard'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls Section */}
        <div className="border-t-2 border-[#141827] pt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#141827]">
              Action Controls:
            </h4>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewModalOpen(true)}
                className="h-7 text-xs border-2 border-[#141827] bg-[#F6D86B] text-[#141827] font-bold hover:bg-[#F6D86B]/90 shadow-tactile-xs"
              >
                Open Review Dialog
              </Button>
            )}
          </div>

          {/* Author Actions — Edit / Delete / Submit (role + ownership + status aware) */}
          {showAuthorBar && (
            <div className="rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-3.5 flex items-center justify-between flex-wrap gap-3 shadow-tactile-xs">
              <span className="text-xs font-bold text-[#141827]">
                Author Actions:
              </span>

              <div className="flex items-center gap-2.5">
                {canEditQuestion && (
                  <Link href={`/questions/${question.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs border-2 border-[#141827] bg-white text-[#141827] hover:bg-slate-100 shadow-tactile-xs font-bold"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#141827]" />
                      <span>Edit Question</span>
                    </Button>
                  </Link>
                )}

                {canSubmitForReview && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submitForReviewMutation.isPending || question.status === 'PENDING_REVIEW' || question.status === 'PUBLISHED'}
                    onClick={() => submitForReviewMutation.mutate(question.id)}
                    className="h-8 gap-1.5 text-xs border-2 border-[#141827] bg-[#F6D86B] text-[#141827] hover:bg-[#F6D86B]/90 font-bold shadow-tactile-xs disabled:opacity-60"
                  >
                    {submitForReviewMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#141827]" />
                    ) : (
                      <Send className="h-3.5 w-3.5 text-[#141827]" />
                    )}
                    <span>
                      {question.status === 'PENDING_REVIEW'
                        ? 'In Review'
                        : 'Submit for Review'}
                    </span>
                  </Button>
                )}

                {canDeleteQuestion && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={handleDelete}
                    className="h-8 gap-1.5 text-xs border-2 border-[#141827] text-red-600 bg-white hover:bg-red-50 shadow-tactile-xs font-bold"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                    <span>Delete</span>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Admin-only Actions: Approve / Reject / Archive */}
          {(canApprove || canReject || canArchive) && (
            <div className="rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-3.5 flex items-center justify-between flex-wrap gap-3 shadow-tactile-xs">
              <span className="text-xs font-bold text-[#141827]">
                Admin Actions:
              </span>

              <div className="flex items-center gap-2.5">
                {canApprove && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={approveMutation.isPending || question.status === 'PUBLISHED'}
                    onClick={() => approveMutation.mutate(question.id)}
                    className="h-8 gap-1.5 text-xs border-2 border-[#141827] bg-[#F6D86B] text-[#141827] hover:bg-[#F6D86B]/90 font-bold shadow-tactile-xs disabled:opacity-60"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#141827]" />
                    ) : (
                      <CheckCircle className="h-3.5 w-3.5 text-[#141827]" />
                    )}
                    <span>Quick Approve</span>
                  </Button>
                )}

                {canReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={rejectMutation.isPending || question.status === 'REJECTED'}
                    onClick={() => setReviewModalOpen(true)}
                    className="h-8 gap-1.5 text-xs border-2 border-[#141827] bg-white text-rose-600 hover:bg-rose-50 shadow-tactile-xs font-bold"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    <span>Reject with Reason</span>
                  </Button>
                )}

                {canArchive && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archiveMutation.isPending || question.status === 'ARCHIVED'}
                    onClick={() => archiveMutation.mutate(question.id)}
                    className="h-8 gap-1.5 text-xs border-2 border-[#141827] bg-white text-[#141827] hover:bg-slate-100 shadow-tactile-xs font-bold"
                  >
                    {archiveMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Archive className="h-3.5 w-3.5" />
                    )}
                    <span>Archive</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review & Rejection Modal */}
      <ReviewQuestionModal
        isOpen={reviewModalOpen}
        question={question}
        onClose={() => setReviewModalOpen(false)}
        onApprove={(qId) => approveMutation.mutate(qId)}
        onReject={(qId, reason) => rejectMutation.mutate({ id: qId, reason })}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </div>
  );
}
