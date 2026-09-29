'use client';

import React, { useEffect } from 'react';
import { Button } from '../components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h2 className="text-xl font-bold text-rose-600">Something went wrong</h2>
      <p className="mt-2 text-xs text-slate-600 max-w-md">
        {error.message || 'An unexpected error occurred while rendering the page.'}
      </p>
      <Button onClick={() => reset()} size="sm" variant="outline" className="mt-4">
        Try Again
      </Button>
    </div>
  );
}
