'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  Info,
  Layers,
  Loader2,
  PenLine,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import type {
  Question,
  QuestionDifficulty,
  QuestionOption,
  QuestionType,
} from '../../types/question';
import { useQuestionMutations } from '../../hooks/useQuestionMutations';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { TaxonomySelector } from './TaxonomySelector';
import { OptionsBuilder } from './OptionsBuilder';
import { MathMarkdown } from '../ui/MathMarkdown';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RejectionReasonBanner } from './RejectionReasonBanner';
import { cn } from '../../lib/utils';

// ============================================================================
// Form Validation Schema
// ============================================================================

export const createQuestionFormSchema = z
  .object({
    subjectId: z.string().min(1, 'Please select a subject'),
    topicId: z.string().min(1, 'Please select a topic'),
    subtopicId: z.string().min(1, 'Please select a subtopic'),
    type: z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    text: z
      .string()
      .min(10, 'Question text must be at least 10 characters')
      .max(2000, 'Question text cannot exceed 2000 characters'),
    options: z
      .array(
        z.object({
          key: z.string().min(1, 'Option key is required'),
          text: z.string(),
        }),
      )
      .min(2, 'At least 2 options are required')
      .max(6, 'Maximum 6 options allowed'),
    correctOption: z.string().min(1, 'Please select the correct option key'),
    explanation: z.string().max(2000, 'Explanation cannot exceed 2000 characters').optional(),
    createFlashcard: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.type === 'MCQ') {
        return data.options.some((opt) => opt.key === data.correctOption);
      }
      return true;
    },
    {
      message: 'The selected correct option must match one of the available options',
      path: ['correctOption'],
    },
  );

export type CreateQuestionFormValues = z.infer<typeof createQuestionFormSchema>;

export interface CreateQuestionFormProps {
  initialData?: Question | null;
  isEdit?: boolean;
  defaultSubjectId?: string;
  defaultTopicId?: string;
  defaultSubtopicId?: string;
  onSuccess?: (question: Question) => void;
}

const DEFAULT_OPTIONS: QuestionOption[] = [
  { key: 'A', text: '' },
  { key: 'B', text: '' },
  { key: 'C', text: '' },
  { key: 'D', text: '' },
];

export function CreateQuestionForm({
  initialData,
  isEdit = false,
  defaultSubjectId,
  defaultTopicId,
  defaultSubtopicId,
  onSuccess,
}: CreateQuestionFormProps): React.JSX.Element {
  const router = useRouter();
  let searchParams: ReturnType<typeof useSearchParams> | null = null;
  try {
    searchParams = useSearchParams();
  } catch {
    searchParams = null;
  }

  // Read URL search params for pre-population if not passed via props
  const querySubjectId = defaultSubjectId || searchParams?.get('subjectId') || '';
  const queryTopicId = defaultTopicId || searchParams?.get('topicId') || '';
  const querySubtopicId = defaultSubtopicId || searchParams?.get('subtopicId') || '';

  // Tab states for live previews
  const [questionTab, setQuestionTab] = useState<'write' | 'preview'>('write');
  const [explanationTab, setExplanationTab] = useState<'write' | 'preview'>('write');

  // Flashcard accordion expanded state
  const [flashcardAccordionOpen, setFlashcardAccordionOpen] = useState(false);

  // Review validation feedback state
  const [reviewValidationFailed, setReviewValidationFailed] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const { createMutation, updateMutation, submitForReviewMutation } =
    useQuestionMutations();

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitForReviewMutation.isPending;

  const defaultValues: CreateQuestionFormValues = {
    subjectId: initialData?.subtopic?.topic?.subject?.id || querySubjectId,
    topicId: initialData?.subtopic?.topic?.id || queryTopicId,
    subtopicId: initialData?.subtopicId || querySubtopicId,
    type: initialData?.type || 'MCQ',
    difficulty: initialData?.difficulty || 'MEDIUM',
    text: initialData?.text || '',
    options: initialData?.options?.length ? initialData.options : DEFAULT_OPTIONS,
    correctOption: initialData?.correctOption || 'A',
    explanation: initialData?.explanation || '',
    createFlashcard: initialData?.hasFlashCard ?? false,
  };

  const form = useForm<CreateQuestionFormValues>({
    resolver: zodResolver(createQuestionFormSchema),
    defaultValues,
  });

  const watchedType = form.watch('type');
  const watchedDifficulty = form.watch('difficulty');
  const watchedText = form.watch('text');
  const watchedExplanation = form.watch('explanation') || '';
  const watchedOptions = form.watch('options');
  const watchedCorrectOption = form.watch('correctOption');
  const watchedCreateFlashcard = form.watch('createFlashcard');
  const watchedSubjectId = form.watch('subjectId');
  const watchedTopicId = form.watch('topicId');
  const watchedSubtopicId = form.watch('subtopicId');

  // Sync accordion expansion when createFlashcard switch changes
  useEffect(() => {
    if (watchedCreateFlashcard) {
      setFlashcardAccordionOpen(true);
    }
  }, [watchedCreateFlashcard]);

  // Keep query params populated if taxonomy loads
  const { subjects, topics, subtopics } = useTaxonomy({
    subjectId: watchedSubjectId || undefined,
    topicId: watchedTopicId || undefined,
  });

  // If subtopicId was passed from URL without subjectId/topicId, auto-select them
  useEffect(() => {
    if (querySubjectId && !form.getValues('subjectId')) {
      form.setValue('subjectId', querySubjectId);
    }
    if (queryTopicId && !form.getValues('topicId')) {
      form.setValue('topicId', queryTopicId);
    }
    if (querySubtopicId && !form.getValues('subtopicId')) {
      form.setValue('subtopicId', querySubtopicId);
    }
  }, [querySubjectId, queryTopicId, querySubtopicId, form]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Quick insertion of LaTeX equation templates into Textarea
  const insertLatexSnippet = (
    fieldName: 'text' | 'explanation',
    snippet: string,
  ) => {
    const currentVal = form.getValues(fieldName) || '';
    form.setValue(fieldName, `${currentVal} ${snippet}`.trim(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Handle Question Type Change
  const handleTypeChange = (newType: QuestionType) => {
    form.setValue('type', newType, { shouldValidate: true });
    if (newType === 'TRUE_FALSE') {
      form.setValue('options', [
        { key: 'A', text: 'True' },
        { key: 'B', text: 'False' },
      ]);
      form.setValue('correctOption', 'A');
    } else if (newType === 'SHORT_ANSWER') {
      form.setValue('options', []);
      form.setValue('correctOption', 'TEXT');
    } else if (newType === 'MCQ') {
      form.setValue('options', DEFAULT_OPTIONS);
      form.setValue('correctOption', 'A');
    }
  };

  // Taxonomy Cascade Handlers
  const handleSubjectChange = (subjectId: string) => {
    form.setValue('subjectId', subjectId, { shouldValidate: true });
    form.setValue('topicId', '', { shouldValidate: true });
    form.setValue('subtopicId', '', { shouldValidate: true });
  };

  const handleTopicChange = (topicId: string) => {
    form.setValue('topicId', topicId, { shouldValidate: true });
    form.setValue('subtopicId', '', { shouldValidate: true });
  };

  const handleSubtopicChange = (subtopicId: string) => {
    form.setValue('subtopicId', subtopicId, { shouldValidate: true });
  };

  // Find correct option text for Flashcard preview
  const correctOptionObject = watchedOptions.find(
    (o) => o.key === watchedCorrectOption,
  );
  const correctOptionText = correctOptionObject?.text?.trim()
    ? correctOptionObject.text
    : `(Option ${watchedCorrectOption} text not yet specified)`;

  // Handle Form Submission: Draft vs Review
  const onSubmit = async (
    values: CreateQuestionFormValues,
    isSubmitForReview: boolean,
  ) => {
    // If Submitting for Review, perform strict non-empty checks
    if (isSubmitForReview) {
      setReviewValidationFailed(true);

      // Validate question text
      if (!values.text.trim() || values.text.trim().length < 10) {
        form.setError('text', {
          type: 'manual',
          message: 'Question text must be at least 10 characters long',
        });
        showToast('Please provide a complete question prompt.', 'error');
        return;
      }

      // Validate all options are filled if MCQ
      if (values.type === 'MCQ') {
        const emptyOpts = values.options.filter((o) => !o.text.trim());
        if (emptyOpts.length > 0) {
          form.setError('options', {
            type: 'manual',
            message: 'All option fields must be non-empty before submitting for review.',
          });
          showToast('Please fill in all answer options before submitting for review.', 'error');
          return;
        }
      }

      // Validate explanation is provided
      if (!values.explanation || !values.explanation.trim()) {
        form.setError('explanation', {
          type: 'manual',
          message: 'An explanation is required before submitting for review.',
        });
        showToast('Please provide an explanation before submitting for review.', 'error');
        return;
      }
    }

    try {
      let savedQuestion: Question;

      if (isEdit && initialData?.id) {
        savedQuestion = await updateMutation.mutateAsync({
          id: initialData.id,
          dto: {
            text: values.text,
            type: values.type,
            difficulty: values.difficulty,
            options: values.options,
            correctOption: values.correctOption,
            explanation: values.explanation,
            subtopicId: values.subtopicId,
          },
        });
      } else {
        savedQuestion = await createMutation.mutateAsync({
          text: values.text,
          type: values.type,
          difficulty: values.difficulty,
          options: values.options,
          correctOption: values.correctOption,
          explanation: values.explanation,
          subtopicId: values.subtopicId,
          createFlashcard: values.createFlashcard,
        });
      }

      if (isSubmitForReview) {
        await submitForReviewMutation.mutateAsync(savedQuestion.id);
        showToast('Question successfully submitted for review ✓', 'success');
        onSuccess?.(savedQuestion);
        setTimeout(() => {
          router.push('/questions');
        }, 1200);
      } else {
        showToast('Question draft saved successfully ✓', 'success');
        onSuccess?.(savedQuestion);
        if (!isEdit) {
          setTimeout(() => {
            router.push(`/questions/${savedQuestion.id}`);
          }, 1000);
        }
      }
    } catch (err: any) {
      // NestJS can return message as string, string[], or nested { message, error, statusCode }
      const raw = err?.response?.data?.message ?? err?.message ?? 'Error saving question';
      const errDetail = Array.isArray(raw) ? raw.join(', ') : String(raw);
      showToast(errDetail, 'error');
    }
  };

  return (
    <div className="relative mx-auto max-w-4xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={cn(
            'fixed top-5 right-5 z-50 flex items-center gap-2.5 rounded-lg px-4 py-3 text-xs font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-3',
            toastMessage.type === 'success' ? 'bg-slate-900 border border-slate-700' : 'bg-rose-600',
          )}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 text-white" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            type="button"
            onClick={() => router.push('/questions')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Question Bank</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isEdit ? 'Edit Assessment Item' : 'Create New Assessment Item'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Author curriculum-aligned questions with LaTeX equations, options integrity, and flashcard synthesis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
            {watchedType}
          </span>
          <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            {watchedDifficulty}
          </span>
        </div>
      </div>

      {/* Rejection Banner for Rejected items */}
      {isEdit && initialData?.status === 'REJECTED' && (
        <RejectionReasonBanner reason={initialData.rejectionReason} />
      )}

      <Form {...form}>
        <form className="space-y-6">
          {/* Section 1: Curriculum Taxonomy */}
          <div className="rounded-xl border-2 border-[#141827] bg-white p-5 shadow-tactile space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  1. Curriculum Taxonomy
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select Subject, Topic, and Subtopic to link this question to the WASSCE syllabus.
                </p>
              </div>
              {watchedSubtopicId && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <Check className="h-3 w-3 stroke-[3]" />
                  <span>Taxonomy Linked</span>
                </span>
              )}
            </div>

            <TaxonomySelector
              subjectId={watchedSubjectId}
              topicId={watchedTopicId}
              subtopicId={watchedSubtopicId}
              onSubjectChange={handleSubjectChange}
              onTopicChange={handleTopicChange}
              onSubtopicChange={handleSubtopicChange}
              initialSubjectId={defaultValues.subjectId}
              initialTopicId={defaultValues.topicId}
            />

            {(form.formState.errors.subjectId ||
              form.formState.errors.topicId ||
              form.formState.errors.subtopicId) && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {form.formState.errors.subjectId?.message ||
                    form.formState.errors.topicId?.message ||
                    form.formState.errors.subtopicId?.message}
                </span>
              </div>
            )}
          </div>

          {/* Section 2: Metadata Configuration (Type & Difficulty) */}
          <div className="rounded-xl border-2 border-[#141827] bg-white p-5 shadow-tactile">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3.5">
              2. Item Metadata & Format
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Question Type
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => handleTypeChange(val as QuestionType)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs bg-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MCQ" className="text-xs">
                          Multiple Choice (MCQ)
                        </SelectItem>
                        <SelectItem value="TRUE_FALSE" className="text-xs">
                          True / False
                        </SelectItem>
                        <SelectItem value="SHORT_ANSWER" className="text-xs">
                          Short Answer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Difficulty Level
                    </FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) =>
                        field.onChange(val as QuestionDifficulty)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs bg-white">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EASY" className="text-xs">
                          Easy (Foundational)
                        </SelectItem>
                        <SelectItem value="MEDIUM" className="text-xs">
                          Medium (Standard)
                        </SelectItem>
                        <SelectItem value="HARD" className="text-xs">
                          Hard (Advanced / Olympiad)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section 3: Question Text with Live Preview Tab */}
          <div className="rounded-xl border-2 border-[#141827] bg-white p-5 shadow-tactile space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Question Prompt
                </h2>
                <p className="text-[11px] text-slate-500">
                  Supports standard Markdown and KaTeX math formatting ($inline$ and $$block$$).
                </p>
              </div>

              {/* [ Write ] / [ Preview ] Tabs */}
              <div className="inline-flex rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-0.5 text-xs shadow-tactile-xs">
                <button
                  type="button"
                  onClick={() => setQuestionTab('write')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all',
                    questionTab === 'write'
                      ? 'bg-[#F6D86B] text-[#141827] shadow-[0_1.5px_0_#141827] border border-[#141827]'
                      : 'text-slate-600 hover:text-[#141827]',
                  )}
                >
                  <PenLine className="h-3 w-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionTab('preview')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all',
                    questionTab === 'preview'
                      ? 'bg-[#F6D86B] text-[#141827] shadow-[0_1.5px_0_#141827] border border-[#141827]'
                      : 'text-slate-600 hover:text-[#141827]',
                  )}
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {questionTab === 'write' ? (
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    {/* LaTeX Quick Insert Helper Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        Math Shortcuts:
                      </span>
                      {[
                        { label: '$x^2$', snippet: '$x^2$' },
                        { label: '$$\\int f(x)dx$$', snippet: '$$\\int f(x)\\,dx$$' },
                        { label: '$\\frac{a}{b}$', snippet: '$\\frac{a}{b}$' },
                        { label: '$\\sqrt{x}$', snippet: '$\\sqrt{x}$' },
                        { label: '$\\sum_{i=1}^n$', snippet: '$\\sum_{i=1}^n$' },
                        { label: '$\\theta$', snippet: '$\\theta$' },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => insertLatexSnippet('text', chip.snippet)}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <FormControl>
                      <Textarea
                        {...field}
                        rows={5}
                        placeholder="Write the question prompt here…"
                        className="font-normal text-xs leading-relaxed"
                      />
                    </FormControl>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        <span>LaTeX math: $x^2 + y^2 = r^2$ for inline, $$\int f(x)dx$$ for display</span>
                      </span>
                      <span
                        className={cn(
                          field.value.length > 1800 ? 'text-amber-600 font-semibold' : '',
                        )}
                      >
                        {field.value.length} / 2000 chars
                      </span>
                    </div>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            ) : (
              <div className="min-h-[140px] rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <MathMarkdown
                  content={watchedText}
                  placeholder="Nothing to preview. Enter question text and math formulas in the Write tab."
                />
              </div>
            )}
          </div>

          {/* Section 4: Answer Configuration & Correct Option */}
          <div className="rounded-xl border-2 border-[#141827] bg-white p-5 shadow-tactile space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              4. Answer Configuration
            </h2>

            {watchedType === 'MCQ' && (
              <Controller
                control={form.control}
                name="options"
                render={({ field }) => (
                  <OptionsBuilder
                    options={field.value}
                    correctOption={watchedCorrectOption}
                    onOptionsChange={field.onChange}
                    onCorrectOptionChange={(optKey) =>
                      form.setValue('correctOption', optKey, {
                        shouldValidate: true,
                      })
                    }
                    error={form.formState.errors.options?.message}
                    reviewValidationFailed={reviewValidationFailed}
                  />
                )}
              />
            )}

            {watchedType === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-700">
                  Select the Correct Option
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {['A', 'B'].map((optKey) => {
                    const label = optKey === 'A' ? 'True' : 'False';
                    const isSelected = watchedCorrectOption === optKey;
                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() =>
                          form.setValue('correctOption', optKey, {
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          'flex items-center justify-between rounded-lg border-2 border-[#141827] p-4 text-xs font-bold transition-all shadow-tactile-sm',
                          isSelected
                            ? 'bg-[#F6D86B] text-[#141827] ring-0'
                            : 'bg-white text-slate-700 hover:bg-[#F8F5EF]',
                        )}
                      >
                        <span className="text-sm font-bold">{label}</span>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-[11px] font-black text-[#141827]">
                            <Check className="h-4 w-4 stroke-[3]" />
                            <span>Correct</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {watchedType === 'SHORT_ANSWER' && (
              <FormField
                control={form.control}
                name="correctOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Expected Answer Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter canonical text answer (e.g. 42 or Photosynthesis)..."
                        className="text-xs h-9 bg-white"
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Student submissions will be compared against this canonical text.
                    </FormDescription>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Section 5: Explanation & Solution with Live Preview Tab */}
          <div className="rounded-xl border-2 border-[#141827] bg-white p-5 shadow-tactile space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  5. Solution & Step-by-Step Explanation
                </h2>
                <p className="text-[11px] text-slate-500">
                  Shown to students after quiz completion. Required for review submission.
                </p>
              </div>

              {/* [ Write ] / [ Preview ] Tabs */}
              <div className="inline-flex rounded-lg border-2 border-[#141827] bg-[#F8F5EF] p-0.5 text-xs shadow-tactile-xs">
                <button
                  type="button"
                  onClick={() => setExplanationTab('write')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all',
                    explanationTab === 'write'
                      ? 'bg-[#F6D86B] text-[#141827] shadow-[0_1.5px_0_#141827] border border-[#141827]'
                      : 'text-slate-600 hover:text-[#141827]',
                  )}
                >
                  <PenLine className="h-3 w-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExplanationTab('preview')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all',
                    explanationTab === 'preview'
                      ? 'bg-[#F6D86B] text-[#141827] shadow-[0_1.5px_0_#141827] border border-[#141827]'
                      : 'text-slate-600 hover:text-[#141827]',
                  )}
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {explanationTab === 'write' ? (
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    {/* LaTeX Quick Insert Helper Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 pb-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                        Math Shortcuts:
                      </span>
                      {[
                        { label: '$u = x$', snippet: '$u = x$' },
                        { label: '$dv = \\cos(x)dx$', snippet: '$dv = \\cos(x)dx$' },
                        { label: '$$\\int u\\,dv = uv - \\int v\\,du$$', snippet: '$$\\int u\\,dv = uv - \\int v\\,du$$' },
                        { label: '$\\therefore$', snippet: '$\\therefore$' },
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => insertLatexSnippet('explanation', chip.snippet)}
                          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="Explain why the correct option is right with clear derivation and mathematical steps..."
                        className="font-normal text-xs leading-relaxed"
                      />
                    </FormControl>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Renders LaTeX and formatting during student review</span>
                      <span>{(field.value || '').length} / 2000 chars</span>
                    </div>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            ) : (
              <div className="min-h-[110px] rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                <MathMarkdown
                  content={watchedExplanation}
                  placeholder="Nothing to preview. Enter step-by-step explanation and equations in the Write tab."
                />
              </div>
            )}
          </div>

          {/* Section 6: Flashcard Generator Accordion */}
          <div className="rounded-xl border-2 border-[#141827] bg-[#F8F5EF] p-5 shadow-tactile space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F6D86B] text-[#141827] border-2 border-[#141827] shadow-tactile-xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      6. Flashcard Generator
                    </h2>
                    <span className="rounded-full bg-[#F6D86B] border border-[#141827] px-2 py-0.5 text-[10px] font-bold text-[#141827]">
                      Active Recall
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Generate a synchronized flashcard for spaced repetition student study decks.
                  </p>
                </div>
              </div>

              {/* Switch Control */}
              <div className="flex items-center gap-3">
                <Label htmlFor="flashcard-switch" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Generate Matching Flashcard
                </Label>
                <Controller
                  control={form.control}
                  name="createFlashcard"
                  render={({ field }) => (
                    <Switch
                      id="flashcard-switch"
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val);
                        setFlashcardAccordionOpen(val);
                      }}
                    />
                  )}
                />
              </div>
            </div>

            {/* Expandable Accordion Body */}
            {watchedCreateFlashcard && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
                <div className="flex items-center justify-between border-t-2 border-[#141827]/10 pt-3">
                  <span className="text-xs font-bold text-[#141827] flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#141827]" />
                    <span>Flashcard Dual-Sided Live Preview</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFlashcardAccordionOpen(!flashcardAccordionOpen)}
                    className="flex items-center gap-1 text-xs text-[#141827] hover:underline font-bold"
                  >
                    <span>{flashcardAccordionOpen ? 'Hide Cards' : 'View Cards'}</span>
                    {flashcardAccordionOpen ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {flashcardAccordionOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Front of Card */}
                    <div className="rounded-xl border-2 border-[#141827] bg-white p-4 shadow-tactile-sm flex flex-col justify-between min-h-[180px]">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Front • Prompt
                          </span>
                          <span className="rounded bg-[#F8F5EF] border border-[#141827] px-1.5 py-0.5 text-[9px] font-bold text-[#141827]">
                            QUESTION
                          </span>
                        </div>
                        <MathMarkdown
                          content={watchedText}
                          placeholder="Front card inherits question prompt text and mathematical formulas."
                        />
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Side 1</span>
                        <span>Auto-synced</span>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="rounded-xl border-2 border-[#141827] bg-white p-4 shadow-tactile-sm flex flex-col justify-between min-h-[180px]">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#141827]">
                            Back • Answer & Solution
                          </span>
                          <span className="rounded bg-[#F6D86B] border border-[#141827] px-1.5 py-0.5 text-[9px] font-bold text-[#141827]">
                            CORRECT ANSWER
                          </span>
                        </div>

                        {/* Correct Option Display */}
                        <div className="mb-2.5 rounded-md border border-[#141827] bg-[#F6D86B]/20 p-2 text-xs font-semibold text-[#141827] flex items-start gap-2">
                          <span className="rounded bg-[#141827] px-1.5 py-0.2 text-[10px] font-bold text-[#F6D86B] shrink-0">
                            Option {watchedCorrectOption}
                          </span>
                          <span className="text-[#141827] font-medium leading-relaxed">
                            {correctOptionText}
                          </span>
                        </div>

                        {/* Explanation preview */}
                        <div className="text-xs text-slate-700">
                          <MathMarkdown
                            content={watchedExplanation}
                            placeholder="Back card inherits correct answer plus the step-by-step explanation."
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                        <span>Side 2</span>
                        <span>Auto-synced</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 7: Action Buttons & Draft vs Review */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border-2 border-[#141827] bg-white p-4 shadow-tactile">
            <div className="text-xs text-slate-500">
              {isEdit ? (
                <span>Editing question ID: <span className="font-mono text-slate-700">{initialData?.id}</span></span>
              ) : (
                <span>Unsaved questions remain in draft state until approved.</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/questions')}
                disabled={isSaving}
                className="text-xs h-9"
              >
                Cancel
              </Button>

              {/* Save Draft Button (status: DRAFT) */}
              <Button
                type="button"
                variant="outline"
                onClick={form.handleSubmit((values) => onSubmit(values, false))}
                disabled={isSaving}
                className="h-9 gap-1.5 text-xs text-[#141827] hover:text-[#141827] border-2 border-[#141827] bg-white hover:bg-slate-50 shadow-tactile-sm"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5 text-slate-500" />
                )}
                <span>Save Draft</span>
              </Button>

              {/* Submit for Review Button (status: PENDING_REVIEW) */}
              <Button
                type="button"
                onClick={form.handleSubmit((values) => onSubmit(values, true))}
                disabled={isSaving}
                className="h-9 gap-1.5 text-xs bg-[#F6D86B] hover:bg-[#F6D86B]/90 text-[#141827] font-bold border-2 border-[#141827] shadow-tactile active:translate-y-0.5 active:shadow-none"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span>Submit for Review</span>
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateQuestionForm;
