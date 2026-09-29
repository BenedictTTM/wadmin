'use client';

import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '../../lib/query-client';
import { AuthProvider } from '../../context/AuthContext';

export function AppProviders({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default AppProviders;
