'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useQuestions } from '../../hooks/useQuestions';
import { useQuestionMutations } from '../../hooks/useQuestionMutations';
import type { Question } from '../../types/question';
import { PendingList } from './PendingList';
import { QuestionPreviewCard } from './QuestionPreviewCard';
import { ReviewQuestionModal } from './ReviewQuestionModal';
import { Button } from '../ui/button';

export interface ReviewQueueProps {
  isAdmin?: boolean;
}

export function ReviewQueue({ isAdmin = true }: ReviewQueueProps): React.JSX.Element {
  const filterParams = React.useMemo(() => ({
    status: 'PENDING_REVIEW' as const,
    limit: 50,
  }), []);

  // Query 50 questions with PENDING_REVIEW status
  const { questions: fetchedQuestions, isLoading } = useQuestions(filterParams);

  // Local state for optimistic UI updates
  const [items, setItems] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [rejectModalQuestionId, setRejectModalQuestionId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync fetched questions with local items state safely
  const fetchedIds = fetchedQuestions?.map((q) => q.id).join(',') ?? '';
  useEffect(() => {
    if (fetchedQuestions) {
      setItems(fetchedQuestions);
      setSelectedQuestionId((prev) => {
        if (prev && fetchedQuestions.some((q) => q.id === prev)) return prev;
        return fetchedQuestions.length > 0 ? fetchedQuestions[0].id : null;
      });
    }
  }, [fetchedIds]);

  const { approveMutation, rejectMutation } = useQuestionMutations();

  const selectedQuestion = items.find((q) => q.id === selectedQuestionId) ?? null;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Optimistic approval handler
  const handleApprove = (id: string) => {
    const previousItems = [...items];
    const nextRemaining = items.filter((q) => q.id !== id);

    // Optimistic removal
    setItems(nextRemaining);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(nextRemaining.length > 0 ? nextRemaining[0].id : null);
    }

    approveMutation.mutate(id, {
      onSuccess: () => {
        showToast('Question approved and published ✓');
      },
      onError: () => {
        // Rollback on error
        setItems(previousItems);
        setSelectedQuestionId(id);
        showToast('Failed to approve question. Restored to queue.');
      },
    });
  };

  // Optimistic rejection handler
  const handleReject = async (id: string, reason: string) => {
    const previousItems = [...items];
    const nextRemaining = items.filter((q) => q.id !== id);

    // Optimistic removal
    setItems(nextRemaining);
    if (selectedQuestionId === id) {
      setSelectedQuestionId(nextRemaining.length > 0 ? nextRemaining[0].id : null);
    }

    rejectMutation.mutate(
      { id, reason },
      {
        onSuccess: () => {
          showToast('Question rejected and returned to draft with feedback ✗');
        },
        onError: () => {
          // Rollback on error
          setItems(previousItems);
          setSelectedQuestionId(id);
          showToast('Failed to reject question. Restored to queue.');
        },
      },
    );
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-white border-2 border-[#141827] rounded-xl shadow-tactile">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-[#141827] border-2 border-[#141827] px-4 py-2.5 text-xs font-bold text-white shadow-tactile animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-[#F6D86B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Split Pane: Desktop view */}
      <div className="hidden md:flex h-full w-full overflow-hidden">
        {/* Left Column (360px fixed) */}
        <div className="w-[360px] flex-shrink-0 border-r-2 border-[#141827]">
          <PendingList
            questions={items}
            isLoading={isLoading}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={(q) => setSelectedQuestionId(q.id)}
          />
        </div>

        {/* Right Column (fills rest) */}
        <div className="flex-1 overflow-hidden">
          <QuestionPreviewCard
            question={selectedQuestion}
            isAdmin={isAdmin}
            onApprove={handleApprove}
            onRejectClick={(id) => setRejectModalQuestionId(id)}
            isApproving={approveMutation.isPending}
          />
        </div>
      </div>

      {/* Mobile View: Stack vertically; preview hidden until question is selected */}
      <div className="flex md:hidden h-full w-full overflow-hidden">
        {!selectedQuestion ? (
          <div className="h-full w-full">
            <PendingList
              questions={items}
              isLoading={isLoading}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={(q) => setSelectedQuestionId(q.id)}
            />
          </div>
        ) : (
          <div className="flex h-full w-full flex-col">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedQuestionId(null)}
                className="gap-1.5 text-xs text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to list</span>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <QuestionPreviewCard
                question={selectedQuestion}
                isAdmin={isAdmin}
                onApprove={handleApprove}
                onRejectClick={(id) => setRejectModalQuestionId(id)}
                isApproving={approveMutation.isPending}
              />
            </div>
          </div>
        )}
      </div>

      {/* Review & Rejection Modal */}
      <ReviewQuestionModal
        isOpen={Boolean(rejectModalQuestionId)}
        question={items.find((q) => q.id === rejectModalQuestionId) ?? selectedQuestion}
        onClose={() => setRejectModalQuestionId(null)}
        onApprove={(id) => handleApprove(id)}
        onReject={(id, reason) => handleReject(id, reason)}
        isApproving={approveMutation.isPending}
        isRejecting={rejectMutation.isPending}
      />
    </div>
  );
}

export default ReviewQueue;
