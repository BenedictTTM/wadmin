'use client';

import React from 'react';
import { AuditLogTable } from '../../../components/audit/AuditLogTable';

export default function AuditPage(): React.JSX.Element {
  return (
    <div className="h-full w-full overflow-hidden">
      <AuditLogTable />
    </div>
  );
}
