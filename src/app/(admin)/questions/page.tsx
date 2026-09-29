'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TaxonomyBrowser } from '../../../components/taxonomy/TaxonomyBrowser';

function QuestionsContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const search = searchParams?.get('search') ?? undefined;

  return (
    <div className="h-full w-full overflow-hidden">
      <TaxonomyBrowser searchQuery={search} />
    </div>
  );
}

export default function QuestionsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center p-8 text-xs text-slate-400 font-medium">
          Loading question bank taxonomy...
        </div>
      }
    >
      <QuestionsContent />
    </Suspense>
  );
}
