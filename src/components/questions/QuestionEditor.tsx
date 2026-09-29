'use client';

import React from 'react';
import { z } from 'zod';
import type { Question } from '../../types/question';
import { CreateQuestionForm } from './CreateQuestionForm';

export const QuestionFormSchema = z.object({
  subtopicId: z.string().min(1, 'Select a subtopic'),
  type: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  text: z
    .string()
    .min(10, 'Question text must be at least 10 characters')
    .max(2000, 'Question text cannot exceed 2000 characters'),
  options: z.array(
    z.object({
      key: z.string(),
      text: z.string().min(1, 'Option text is required'),
    }),
  ),
  correctOption: z.string().min(1, 'Correct option is required'),
  explanation: z.string().max(2000).optional(),
});

export type QuestionFormValues = z.infer<typeof QuestionFormSchema>;

export interface QuestionEditorProps {
  initialData?: Question | null;
  isEdit?: boolean;
}

export function QuestionEditor({
  initialData,
  isEdit = false,
}: QuestionEditorProps): React.JSX.Element {
  return <CreateQuestionForm initialData={initialData} isEdit={isEdit} />;
}

export default QuestionEditor;
