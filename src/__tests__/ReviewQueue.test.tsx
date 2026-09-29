import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReviewQueue } from '../components/review/ReviewQueue';
import type { Question } from '../types/question';

const mockApproveMutate = vi.fn();
const mockRejectMutate = vi.fn();

const mockQuestions: Question[] = [
  {
    id: 'q-review-1',
    text: 'What is the speed of light in vacuum?',
    type: 'MCQ',
    difficulty: 'HARD',
    status: 'PENDING_REVIEW',
    subtopicId: 'subtop-1',
    authorId: 'user-1',
    options: [
      { key: 'A', text: '3 x 10^8 m/s' },
      { key: 'B', text: '3 x 10^6 m/s' },
    ],
    correctOption: 'A',
    hasFlashCard: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

vi.mock('../hooks/useQuestions', () => ({
  useQuestions: () => ({
    questions: mockQuestions,
    isLoading: false,
  }),
}));

vi.mock('../hooks/useQuestionMutations', () => ({
  useQuestionMutations: () => ({
    approveMutation: {
      mutate: mockApproveMutate,
      isPending: false,
    },
    rejectMutation: {
      mutate: mockRejectMutate,
      isPending: false,
    },
  }),
}));

describe('ReviewQueue Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls approveMutation with the question ID when Approve button is clicked', () => {
    render(<ReviewQueue isAdmin={true} />);

    const approveButton = screen.getAllByText('Approve ✓')[0];
    fireEvent.click(approveButton);

    expect(mockApproveMutate).toHaveBeenCalledWith(
      'q-review-1',
      expect.any(Object),
    );
  });

  it('opens Reject modal when Reject button is clicked and disables submit until reason is at least 10 chars', async () => {
    render(<ReviewQueue isAdmin={true} />);

    const rejectButton = screen.getAllByText('Reject ✗')[0];
    fireEvent.click(rejectButton);

    // Modal should be open
    expect(screen.getByText('Reject question')).toBeDefined();

    const textarea = screen.getByPlaceholderText('Explain what needs to be changed…');
    // Initially submit is disabled
    const modalRejectBtn = screen.getAllByRole('button', { name: 'Reject' })[0];
    expect((modalRejectBtn as HTMLButtonElement).disabled).toBe(true);

    // Enter under 10 chars
    fireEvent.change(textarea, { target: { value: 'Too bad' } });
    expect((modalRejectBtn as HTMLButtonElement).disabled).toBe(true);

    // Enter 10 or more chars
    fireEvent.change(textarea, {
      target: { value: 'Please fix option B typo and verify unit.' },
    });
    expect((modalRejectBtn as HTMLButtonElement).disabled).toBe(false);

    // Submit
    fireEvent.click(modalRejectBtn);
    expect(mockRejectMutate).toHaveBeenCalledWith(
      {
        id: 'q-review-1',
        reason: 'Please fix option B typo and verify unit.',
      },
      expect.any(Object),
    );
  });

  it('renders read-only notice and hides approve/reject buttons when isAdmin is false', () => {
    render(<ReviewQueue isAdmin={false} />);

    expect(
      screen.getAllByText('Only admins can approve or reject questions.')[0],
    ).toBeDefined();
    expect(screen.queryByText('Approve ✓')).toBeNull();
    expect(screen.queryByText('Reject ✗')).toBeNull();
  });
});
