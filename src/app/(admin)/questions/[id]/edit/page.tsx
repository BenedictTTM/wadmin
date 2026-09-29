'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useQuestion } from '../../../../../hooks/useQuestion';
import { usePermissions } from '../../../../../hooks/usePermissions';
import { QuestionEditor } from '../../../../../components/questions/QuestionEditor';
import { Button } from '../../../../../components/ui/button';

export default function EditQuestionPage(): React.JSX.Element {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : null;

  const { data: question, isLoading, isError } = useQuestion(id);
  const { canEditQuestion } = usePermissions(question);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#F5F1E8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#141827]" />
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-[#F5F1E8]">
        <div className="rounded-xl border-3 border-[#141827] bg-white p-8 shadow-tactile-xl max-w-md w-full">
          <h3 className="text-base font-black text-[#141827]">Question Not Found</h3>
          <p className="mt-1 text-xs text-slate-600">
            Unable to locate the requested question for editing.
          </p>
        </div>
      </div>
    );
  }

  // Guard: user cannot edit this question (not owner, wrong status, or insufficient role)
  if (!canEditQuestion) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-[#F5F1E8]">
        <div className="rounded-xl border-3 border-[#141827] bg-white p-8 shadow-tactile-xl max-w-md w-full flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 border-2 border-[#141827]">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#141827]">Access Denied</h3>
            <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto">
              You cannot edit this question. You must be the author and the question
              must be in <strong>DRAFT</strong> or <strong>REJECTED</strong> status.
              {' '}Current status: <strong>{question.status}</strong>.
            </p>
          </div>
          <Link href={`/questions/${question.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="border-2 border-[#141827] bg-[#F6D86B] text-[#141827] font-bold shadow-tactile-xs hover:bg-[#F6D86B]/90"
            >
              View Question
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F5F1E8]">
      <QuestionEditor initialData={question} isEdit={true} />
    </div>
  );
}
