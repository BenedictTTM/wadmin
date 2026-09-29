'use client';

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { ReviewQueue } from '../../../components/review/ReviewQueue';

export default function ReviewPage(): React.JSX.Element {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  return (
    <div className="h-full w-full overflow-hidden">
      <ReviewQueue isAdmin={isAdmin} />
    </div>
  );
}
