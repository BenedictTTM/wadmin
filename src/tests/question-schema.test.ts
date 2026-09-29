import { QuestionFormSchema } from '../components/questions/QuestionEditor';

describe('QuestionFormSchema Validation', () => {
  it('validates a valid MCQ question', () => {
    const validMCQ = {
      subtopicId: 'subtopic-123',
      type: 'MCQ',
      difficulty: 'MEDIUM',
      text: 'What is the capital of Ghana?',
      options: [
        { key: 'A', text: 'Accra' },
        { key: 'B', text: 'Kumasi' },
        { key: 'C', text: 'Tamale' },
        { key: 'D', text: 'Cape Coast' },
      ],
      correctOption: 'A',
      explanation: 'Accra is the capital and largest city.',
    };

    const result = QuestionFormSchema.safeParse(validMCQ);
    expect(result.success).toBe(true);
  });

  it('fails if text is under 10 characters', () => {
    const invalidShortText = {
      subtopicId: 'subtopic-123',
      type: 'MCQ',
      difficulty: 'EASY',
      text: 'Short',
      options: [
        { key: 'A', text: 'Yes' },
        { key: 'B', text: 'No' },
      ],
      correctOption: 'A',
    };

    const result = QuestionFormSchema.safeParse(invalidShortText);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some((e) => e.path.includes('text'))).toBe(true);
    }
  });

  it('fails if subtopicId is missing', () => {
    const missingSubtopic = {
      subtopicId: '',
      type: 'TRUE_FALSE',
      difficulty: 'EASY',
      text: 'Mount Everest is the highest mountain on Earth.',
      options: [
        { key: 'A', text: 'True' },
        { key: 'B', text: 'False' },
      ],
      correctOption: 'A',
    };

    const result = QuestionFormSchema.safeParse(missingSubtopic);
    expect(result.success).toBe(false);
  });
});
