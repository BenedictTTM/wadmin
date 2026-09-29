import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface RejectionReasonBannerProps {
  reason?: string | null;
}

export function RejectionReasonBanner({
  reason,
}: RejectionReasonBannerProps): React.JSX.Element | null {
  if (!reason) return null;

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4 text-rose-900 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-rose-800">
            Changes requested
          </h4>
          <p className="text-xs text-rose-700 leading-relaxed whitespace-pre-wrap">
            {reason}
          </p>
          <p className="text-[11px] font-medium text-rose-500 pt-1">
            Update the question and re-submit for review.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RejectionReasonBanner;
