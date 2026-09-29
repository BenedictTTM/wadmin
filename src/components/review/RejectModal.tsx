'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

export interface RejectModalProps {
  isOpen: boolean;
  questionId: string | null;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function RejectModal({
  isOpen,
  questionId,
  onClose,
  onSubmit,
  isSubmitting = false,
}: RejectModalProps): React.JSX.Element {
  const [reason, setReason] = useState('');

  const isValid = reason.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionId || !isValid) return;
    await onSubmit(questionId, reason.trim());
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[460px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Reject question</DialogTitle>
            <DialogDescription>
              Explain why this question needs revision. Minimum 10 characters required.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain what needs to be changed…"
              rows={4}
              required
              className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-1 flex justify-between text-[11px] text-slate-400">
              <span>{reason.trim().length} / 10 characters minimum</span>
              {reason.trim().length > 0 && !isValid && (
                <span className="text-rose-500">Must be at least 10 characters</span>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Rejecting…' : 'Reject'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default RejectModal;
