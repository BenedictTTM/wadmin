import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TaxonomyBrowser } from '../components/taxonomy/TaxonomyBrowser';

// Mock React Query Hooks from ../hooks/useQuestions
vi.mock('../hooks/useQuestions', () => ({
  useQuestions: vi.fn(),
  useQuestionsInfinite: vi.fn(),
  default: vi.fn(),
}));

vi.mock('../hooks/useTaxonomy', () => ({
  useTaxonomy: vi.fn(),
}));

vi.mock('../hooks/useQuestionMutations', () => ({
  useQuestionMutations: () => ({
    createMutation: { mutate: vi.fn(), isPending: false },
    updateMutation: { mutate: vi.fn(), isPending: false },
    deleteMutation: { mutate: vi.fn(), isPending: false },
    submitForReviewMutation: { mutate: vi.fn(), isPending: false },
    approveMutation: { mutate: vi.fn(), isPending: false },
    rejectMutation: { mutate: vi.fn(), isPending: false },
    archiveMutation: { mutate: vi.fn(), isPending: false },
  }),
}));

import { useTaxonomy } from '../hooks/useTaxonomy';
import { useQuestionsInfinite } from '../hooks/useQuestions';

describe('TaxonomyBrowser Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useTaxonomy as any).mockReturnValue({
      subjects: {
        data: [{ id: 'subj-1', name: 'Core Mathematics', code: 'CORE_MATH' }],
        isLoading: false,
      },
      topics: {
        data: [{ id: 'topic-1', name: 'Algebra', subjectId: 'subj-1' }],
        isLoading: false,
      },
      subtopics: {
        data: [{ id: 'subtopic-1', name: 'Linear Equations', topicId: 'topic-1' }],
        isLoading: false,
      },
    });

    (useQuestionsInfinite as any).mockReturnValue({
      data: {
        pages: [
          {
            data: [
              {
                id: 'q-1',
                text: 'Solve for x: 2x + 4 = 10',
                difficulty: 'EASY',
                type: 'MCQ',
                status: 'PUBLISHED',
                hasFlashCard: true,
                options: [{ key: 'A', text: '3' }],
                correctOption: 'A',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            total: 1,
          },
        ],
      },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    });
  });

  it('renders initial subject column with mock subjects on mount', () => {
    render(<TaxonomyBrowser />);
    expect(screen.getAllByText('Core Mathematics')[0]).toBeDefined();
  });

  it('shows empty placeholder for QuestionListPanel when no subtopic is selected', () => {
    render(<TaxonomyBrowser />);
    expect(screen.getAllByText('No Subtopic Selected')[0]).toBeDefined();
  });

  it('populates questions and renders FlashCardIndicator with Zap icon when a subtopic is selected', () => {
    const { container } = render(<TaxonomyBrowser />);

    // Click Subject
    const subjectBtn = screen.getAllByText('Core Mathematics')[0];
    fireEvent.click(subjectBtn);

    // Click Topic
    const topicBtn = screen.getAllByText('Algebra')[0];
    fireEvent.click(topicBtn);

    // Click Subtopic
    const subtopicBtn = screen.getAllByText('Linear Equations')[0];
    fireEvent.click(subtopicBtn);

    // Questions panel should now render question prompt
    expect(screen.getAllByText(/Solve for x: 2x \+ 4 = 10/)[0]).toBeDefined();

    // FlashCardIndicator should render Zap icon
    const zapIcon = container.querySelector('svg.lucide-zap');
    expect(zapIcon).not.toBeNull();
  });
});
