import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getQuestion } from '../api/questions';
import type { Question } from '../types/question';

/**
 * Hook to fetch a single question by its unique identifier.
 * Query is enabled only when a valid non-null ID is provided.
 *
 * @param id - The question UUID or null/undefined if unselected.
 * @returns TanStack Query result containing the question entity.
 *
 * @example
 * ```tsx
 * const { data: question, isLoading, error } = useQuestion(questionId);
 * ```
 */
export function useQuestion(
  id: string | null | undefined,
): UseQueryResult<Question, Error> {
  return useQuery<Question, Error>({
    queryKey: ['question', id],
    queryFn: () => {
      if (!id) {
        throw new Error('Question ID is required');
      }
      return getQuestion(id);
    },
    enabled: Boolean(id),
  });
}

export default useQuestion;
