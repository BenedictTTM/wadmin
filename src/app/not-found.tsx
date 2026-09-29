import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="mt-2 text-base font-semibold text-slate-800">Page Not Found</h2>
      <p className="mt-1 text-xs text-slate-500">
        The requested screen or question could not be found.
      </p>
      <Link href="/questions" className="mt-5">
        <Button size="sm">Back to Question Bank</Button>
      </Link>
    </div>
  );
}
