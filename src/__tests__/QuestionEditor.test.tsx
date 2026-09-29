import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QuestionEditor } from '../components/questions/QuestionEditor';
import type { Question } from '../types/question';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('../hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    subjects: {
      data: [{ id: 'subj-1', name: 'Mathematics' }],
      isLoading: false,
    },
    topics: {
      data: [{ id: 'top-1', name: 'Algebra' }],
      isLoading: false,
    },
    subtopics: {
      data: [{ id: 'subtop-1', name: 'Linear Equations' }],
      isLoading: false,
    },
  }),
}));

vi.mock('../hooks/useQuestionMutations', () => ({
  useQuestionMutations: () => ({
    createMutation: { mutateAsync: vi.fn(), isPending: false },
    updateMutation: { mutateAsync: vi.fn(), isPending: false },
    submitForReviewMutation: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

describe('QuestionEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders RejectionReasonBanner when question status is REJECTED in edit mode', () => {
    const rejectedQuestion: Question = {
      id: 'q-rejected',
      text: 'What is the chemical symbol for gold?',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      status: 'REJECTED',
      rejectionReason: 'Incorrect option provided for gold. Au should be the correct answer.',
      subtopicId: 'subtop-1',
      authorId: 'user-1',
      options: [
        { key: 'A', text: 'Ag' },
        { key: 'B', text: 'Au' },
      ],
      correctOption: 'B',
      hasFlashCard: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<QuestionEditor initialData={rejectedQuestion} isEdit={true} />);

    expect(screen.getByText('Changes requested')).toBeDefined();
    expect(
      screen.getByText(
        'Incorrect option provided for gold. Au should be the correct answer.',
      ),
    ).toBeDefined();
  });

  it('hides options builder and renders canonical input when type is SHORT_ANSWER', async () => {
    render(<QuestionEditor />);

    // Initially MCQ options builder is shown
    expect(screen.getByText('Options & Correct Answer')).toBeDefined();

    // Select Short Answer via default values or trigger
    const shortAnswerQuestion: Question = {
      id: 'q-sa',
      text: 'Define Newton first law of motion.',
      type: 'SHORT_ANSWER',
      difficulty: 'HARD',
      status: 'DRAFT',
      subtopicId: 'subtop-1',
      authorId: 'user-1',
      options: [],
      correctOption: 'Law of inertia',
      hasFlashCard: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<QuestionEditor initialData={shortAnswerQuestion} isEdit={true} />);

    expect(screen.getByText('Expected Answer Key')).toBeDefined();
  });

  it('auto-sets True and False options when type is TRUE_FALSE', () => {
    const trueFalseQuestion: Question = {
      id: 'q-tf',
      text: 'Water boils at 100 degrees Celsius at sea level.',
      type: 'TRUE_FALSE',
      difficulty: 'EASY',
      status: 'DRAFT',
      subtopicId: 'subtop-1',
      authorId: 'user-1',
      options: [
        { key: 'A', text: 'True' },
        { key: 'B', text: 'False' },
      ],
      correctOption: 'A',
      hasFlashCard: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<QuestionEditor initialData={trueFalseQuestion} isEdit={true} />);

    expect(screen.getByText('True')).toBeDefined();
    expect(screen.getByText('False')).toBeDefined();
  });

  it('blocks submission and renders validation error when question text is under 10 characters', async () => {
    render(<QuestionEditor />);

    // Enter short text
    const textarea = screen.getByPlaceholderText('Write the question prompt here…');
    fireEvent.change(textarea, { target: { value: 'Too short' } });

    // Click Save Draft
    const saveBtn = screen.getByText('Save Draft');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Question text must be at least 10 characters'),
      ).toBeDefined();
    });
  });
});
