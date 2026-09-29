'use client';

import React, { Suspense } from 'react';
import { CreateQuestionForm } from '../../../../components/questions/CreateQuestionForm';
import { Loader2 } from 'lucide-react';

export default function NewQuestionPage(): React.JSX.Element {
  return (
    <div className="h-full w-full overflow-y-auto bg-slate-50/50">
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        }
      >
        <CreateQuestionForm isEdit={false} />
      </Suspense>
    </div>
  );
}
