'use client';

import React, { useState } from 'react';
import {
  Check,
  CheckCircle,
  Clock,
  Loader2,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import type { Question } from '../../types/question';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface ReviewQuestionModalProps {
  isOpen: boolean;
  question: Question | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string, reason: string) => Promise<void> | void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function ReviewQuestionModal({
  isOpen,
  question,
  onClose,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: ReviewQuestionModalProps): React.JSX.Element | null {
  const [feedback, setFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  if (!isOpen || !question) return null;

  const subjectName = question.subtopic?.topic?.subject?.name || 'Mathematics';
  const topicName = question.subtopic?.topic?.name || 'Calculus';
  const subtopicName = question.subtopic?.name || 'Integration by Parts';
  const taxonomyBreadcrumb = `${subjectName} > ${topicName} > ${subtopicName}`;

  const authorName = question.author?.name || (question.author?.email ? question.author.email.split('@')[0] : 'Author');
  const authorRole = 'Teacher';
  const submittedDate = question.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(question.createdAt))
    : 'Sep 28, 2026';

  const correctOptionObj = question.options?.find((o) => o.key === question.correctOption);
  const correctAnswerText = correctOptionObj
    ? `(${correctOptionObj.key}) ${correctOptionObj.text}`
    : question.correctOption || 'None specified';

  const handleRejectClick = async () => {
    const trimmed = feedback.trim();
    if (!trimmed) {
      setFeedbackError('Rejection feedback is required explaining why this question needs revision.');
      return;
    }
    if (trimmed.length < 10) {
      setFeedbackError('Feedback must be at least 10 characters long.');
      return;
    }

    setFeedbackError(null);
    await onReject(question.id, trimmed);
    setFeedback('');
    onClose();
  };

  const handleApproveClick = async () => {
    setFeedbackError(null);
    await onApprove(question.id);
    setFeedback('');
    onClose();
  };

  const handleClose = () => {
    setFeedback('');
    setFeedbackError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-2xl rounded-xl border-3 border-[#141827] bg-white shadow-tactile-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex h-13 items-center justify-between border-b-2 border-[#141827] px-6 py-3.5 bg-[#F0EBE0]">
          <h2 className="text-sm font-bold text-[#141827] tracking-tight">
            Review Question: <span className="font-mono font-bold text-[#141827] bg-[#F6D86B] px-1.5 py-0.5 rounded border border-[#141827]">#{question.id.slice(0, 12)}</span>
            <span className="sr-only">Reject question</span>
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#141827]">
          {/* Metadata Row */}
          <div className="space-y-1 rounded-lg bg-[#F8F5EF] border-2 border-[#141827] p-3 shadow-tactile-xs">
            <p className="text-slate-800 font-medium">
              <span className="font-bold text-[#141827]">Submitted by:</span> {authorName} ({authorRole}) • <span className="text-slate-500 font-normal">Submitted: {submittedDate}</span>
            </p>
            <p className="text-slate-800 font-medium">
              <span className="font-bold text-[#141827]">Taxonomy:</span> {taxonomyBreadcrumb}
            </p>
          </div>

          {/* Question Prompt */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#141827]">
              Question Prompt:
            </h4>
            <div className="rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-3.5 text-[#141827] font-medium leading-relaxed whitespace-pre-wrap text-[13px] shadow-tactile-xs">
              &quot;{question.text}&quot;
            </div>
          </div>

          {/* Correct Answer */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#141827]">
              Correct Answer:
            </h4>
            <div className="flex items-center gap-2 rounded-lg border-2 border-[#141827] bg-[#F6D86B]/30 p-3 text-[#141827] font-bold text-[13px] shadow-tactile-xs">
              <Check className="h-4 w-4 text-[#141827] stroke-[3] shrink-0" />
              <span>{correctAnswerText}</span>
            </div>
          </div>

          {/* Associated Flashcard */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#141827]">
              Associated Flashcard:
            </h4>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold border-2 border-[#141827] shadow-tactile-xs',
                  question.hasFlashCard
                    ? 'bg-[#F6D86B] text-[#141827]'
                    : 'bg-[#F8F5EF] text-slate-500',
                )}
              >
                <Zap className={cn('h-3.5 w-3.5', question.hasFlashCard ? 'text-[#141827] fill-[#141827]' : 'text-slate-400')} />
                {question.hasFlashCard ? '[⚡ Flashcard Attached]' : '[○ No Flashcard]'}
              </span>
              {question.hasFlashCard && (
                <span className="text-xs text-slate-600 font-medium">
                  (Deck: {subtopicName} Fundamentals)
                </span>
              )}
            </div>
          </div>

          {/* Rejection Feedback */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#141827]">
                Rejection Feedback (Required only if rejecting):
              </h4>
            </div>
            <textarea
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                if (feedbackError) setFeedbackError(null);
              }}
              placeholder="Explain what needs to be changed…"
              rows={3}
              className={cn(
                'w-full rounded-lg border-2 border-[#141827] p-3 text-xs text-[#141827] placeholder:text-slate-400 shadow-tactile-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#F6D86B]',
                feedbackError
                  ? 'border-red-500 bg-red-50/20'
                  : 'bg-white',
              )}
            />
            {feedbackError && (
              <p className="text-[11px] text-red-600 font-medium">{feedbackError}</p>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t-2 border-[#141827] bg-[#F8F5EF] px-6 py-3.5 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="text-xs text-slate-700 hover:text-[#141827]"
          >
            [ Close ]
          </Button>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isRejecting || isApproving || feedback.trim().length < 10}
              onClick={handleRejectClick}
              className="gap-1.5 text-xs border-red-500 text-red-600 hover:bg-red-50"
            >
              {isRejecting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>Reject</span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isApproving || isRejecting}
              onClick={handleApproveClick}
              className="gap-1.5 text-xs bg-[#F6D86B] hover:bg-[#F6D86B]/90 text-[#141827] font-bold border-2 border-[#141827] shadow-tactile active:translate-y-0.5 active:shadow-none"
            >
              {isApproving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              <span>[ ✓ Approve ]</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewQuestionModal;
