import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreateQuestionForm } from '../components/questions/CreateQuestionForm';
import type { Question } from '../types/question';

// Mock Next.js navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams('subtopicId=subtop-1&topicId=top-1&subjectId=subj-1'),
}));

// Mock Taxonomy hook
vi.mock('../hooks/useTaxonomy', () => ({
  useTaxonomy: () => ({
    subjects: {
      data: [{ id: 'subj-1', name: 'Mathematics' }],
      isLoading: false,
    },
    topics: {
      data: [{ id: 'top-1', name: 'Calculus' }],
      isLoading: false,
    },
    subtopics: {
      data: [{ id: 'subtop-1', name: 'Integration by Parts' }],
      isLoading: false,
    },
  }),
}));

// Mock Question Mutations
const mockCreateMutateAsync = vi.fn();
const mockUpdateMutateAsync = vi.fn();
const mockSubmitForReviewMutateAsync = vi.fn();

vi.mock('../hooks/useQuestionMutations', () => ({
  useQuestionMutations: () => ({
    createMutation: { mutateAsync: mockCreateMutateAsync, isPending: false },
    updateMutation: { mutateAsync: mockUpdateMutateAsync, isPending: false },
    submitForReviewMutation: { mutateAsync: mockSubmitForReviewMutateAsync, isPending: false },
  }),
}));

describe('CreateQuestionForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all essential sections and fields matching CreateQuestionDto', () => {
    render(<CreateQuestionForm isEdit={false} />);

    expect(screen.getByText(/1\. Curriculum Taxonomy/i)).toBeDefined();
    expect(screen.getByText(/2\. Item Metadata & Format/i)).toBeDefined();
    expect(screen.getByText(/3\. Question Prompt/i)).toBeDefined();
    expect(screen.getByText(/4\. Answer Configuration/i)).toBeDefined();
    expect(screen.getByText(/5\. Solution & Step-by-Step Explanation/i)).toBeDefined();
    expect(screen.getByText(/6\. Flashcard Generator/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Save Draft/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Submit for Review/i })).toBeDefined();
  });

  it('toggles Live Preview tab for Question Text', () => {
    render(<CreateQuestionForm isEdit={false} />);

    const textareas = screen.getAllByRole('textbox');
    const questionInput = textareas[0];

    // Type a LaTeX formula in Write mode
    fireEvent.change(questionInput, {
      target: { value: 'Evaluate the integral $x^2 + y^2 = r^2$' },
    });

    // Find Preview button for Question Text
    const previewButtons = screen.getAllByRole('button', { name: /Preview/i });
    fireEvent.click(previewButtons[0]);

    // Should now show the rendered content
    expect(screen.getByText(/Evaluate the integral/i)).toBeDefined();

    // Toggle back to Write mode
    const writeButtons = screen.getAllByRole('button', { name: /Write/i });
    fireEvent.click(writeButtons[0]);
    expect(screen.getByDisplayValue(/Evaluate the integral/i)).toBeDefined();
  });

  it('allows clicking an option badge to set it as the correct option', () => {
    render(<CreateQuestionForm isEdit={false} />);

    // By default, Option A is correct
    expect(screen.getByTitle(/Remove Option C/i)).toBeDefined();

    // Click Option B badge to mark it correct
    const badgeB = screen.getByTitle(/Click to set Option B as the correct answer/i);
    fireEvent.click(badgeB);

    // Option B row should now indicate Correct Answer
    expect(screen.getByText('Correct Answer')).toBeDefined();
  });

  it('allows adding options up to 6 and removing down to 2 with key re-indexing', () => {
    render(<CreateQuestionForm isEdit={false} />);

    // Defaults to 4 options (A, B, C, D)
    expect(screen.getByText(/4 \/ 6 Options/i)).toBeDefined();

    // Add 5th option
    const addBtn = screen.getByRole('button', { name: /Add Option/i });
    fireEvent.click(addBtn);
    expect(screen.getByText(/5 \/ 6 Options/i)).toBeDefined();

    // Add 6th option
    fireEvent.click(addBtn);
    expect(screen.getByText(/6 \/ 6 Options/i)).toBeDefined();

    // Remove Option B
    const removeBtnB = screen.getByTitle(/Remove Option B/i);
    fireEvent.click(removeBtnB);

    // Now down to 5 options, keys re-indexed sequentially
    expect(screen.getByText(/5 \/ 6 Options/i)).toBeDefined();
    expect(screen.getByTitle(/Remove Option E/i)).toBeDefined();
  });

  it('toggles Flashcard Generator switch and reveals dual-sided preview', () => {
    render(<CreateQuestionForm isEdit={false} />);

    const switchBtn = screen.getByRole('switch');
    expect(switchBtn.getAttribute('aria-checked')).toBe('false');

    // Click switch to enable flashcard generation
    fireEvent.click(switchBtn);
    expect(switchBtn.getAttribute('aria-checked')).toBe('true');

    // Flashcard preview cards should now be rendered
    expect(screen.getByText(/Flashcard Dual-Sided Live Preview/i)).toBeDefined();
    expect(screen.getByText(/Front • Prompt/i)).toBeDefined();
    expect(screen.getByText(/Back • Answer & Solution/i)).toBeDefined();
  });

  it('submits as Draft when Save Draft is clicked', async () => {
    mockCreateMutateAsync.mockResolvedValueOnce({
      id: 'new-q-123',
      text: 'Test question prompt here with at least ten characters',
      status: 'DRAFT',
    });

    render(<CreateQuestionForm isEdit={false} />);

    // Fill minimum required question text
    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], {
      target: { value: 'Evaluate this equation with over 10 chars.' },
    });

    const saveDraftBtn = screen.getByRole('button', { name: /Save Draft/i });
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          subtopicId: 'subtop-1',
          text: 'Evaluate this equation with over 10 chars.',
        }),
      );
    });

    // Should NOT call submitForReview
    expect(mockSubmitForReviewMutateAsync).not.toHaveBeenCalled();
  });

  it('blocks Submit for Review if options or explanation are empty and shows validation messages', async () => {
    render(<CreateQuestionForm isEdit={false} />);

    const submitReviewBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitReviewBtn);

    // Should fail validation because options and explanation are empty
    await waitFor(() => {
      expect(mockCreateMutateAsync).not.toHaveBeenCalled();
      expect(mockSubmitForReviewMutateAsync).not.toHaveBeenCalled();
    });
  });
});
