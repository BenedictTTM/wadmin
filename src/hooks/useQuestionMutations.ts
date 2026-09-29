import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import {
  approveQuestion,
  archiveQuestion,
  createQuestion,
  deleteQuestion,
  rejectQuestion,
  submitForReview,
  updateQuestion,
} from '../api/questions';
import type {
  CreateQuestionDto,
  Question,
  UpdateQuestionDto,
} from '../types/question';

/**
 * Optional callbacks for mutation hooks.
 */
export interface UseQuestionMutationsOptions {
  onError?: (error: Error, variables: unknown) => void;
}

/**
 * Return shape containing all question write mutations.
 */
export interface UseQuestionMutationsResult {
  createMutation: UseMutationResult<Question, Error, CreateQuestionDto>;
  updateMutation: UseMutationResult<
    Question,
    Error,
    { id: string; dto: UpdateQuestionDto }
  >;
  deleteMutation: UseMutationResult<void, Error, string>;
  submitForReviewMutation: UseMutationResult<Question, Error, string>;
  approveMutation: UseMutationResult<Question, Error, string>;
  rejectMutation: UseMutationResult<
    Question,
    Error,
    { id: string; reason: string }
  >;
  archiveMutation: UseMutationResult<Question, Error, string>;
}

/**
 * Hook providing all question write operations with automatic cache invalidation.
 *
 * Each mutation invalidates:
 * - ['questions'] (all list queries)
 * - ['question', id] (specific question query)
 *
 * @param options - Optional configuration including onError callback.
 * @returns Individual mutation objects: createMutation, updateMutation, deleteMutation,
 *          submitForReviewMutation, approveMutation, rejectMutation, archiveMutation.
 *
 * @example
 * ```tsx
 * const { approveMutation, rejectMutation } = useQuestionMutations({
 *   onError: (error) => toast.error(error.message),
 * });
 *
 * // Approve
 * approveMutation.mutate(questionId);
 *
 * // Reject
 * rejectMutation.mutate({ id: questionId, reason: 'Needs better options' });
 * ```
 */
export function useQuestionMutations(
  options?: UseQuestionMutationsOptions,
): UseQuestionMutationsResult {
  const queryClient = useQueryClient();

  const createMutation = useMutation<Question, Error, CreateQuestionDto>({
    mutationFn: (dto: CreateQuestionDto) => createQuestion(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', data.id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const updateMutation = useMutation<
    Question,
    Error,
    { id: string; dto: UpdateQuestionDto }
  >({
    mutationFn: ({ id, dto }) => updateQuestion(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', variables.id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const submitForReviewMutation = useMutation<Question, Error, string>({
    mutationFn: (id: string) => submitForReview(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const approveMutation = useMutation<Question, Error, string>({
    mutationFn: (id: string) => approveQuestion(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const rejectMutation = useMutation<
    Question,
    Error,
    { id: string; reason: string }
  >({
    mutationFn: ({ id, reason }) => rejectQuestion(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', variables.id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  const archiveMutation = useMutation<Question, Error, string>({
    mutationFn: (id: string) => archiveQuestion(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question', id] });
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    submitForReviewMutation,
    approveMutation,
    rejectMutation,
    archiveMutation,
  };
}

export default useQuestionMutations;
