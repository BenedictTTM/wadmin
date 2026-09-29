import {
  useInfiniteQuery,
  useQuery,
  type DefinedInitialDataInfiniteOptions,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { listQuestions } from '../api/questions';
import type {
  Question,
  QuestionFilters,
  QuestionListResponse,
} from '../types/question';

/**
 * Return signature for the useQuestions hook.
 */
export interface UseQuestionsResult {
  questions: Question[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  nextCursor?: string;
  refetch: () => Promise<unknown>;
  query: UseQueryResult<QuestionListResponse, Error>;
}

/**
 * Hook to fetch a paginated list of questions based on filters.
 *
 * @param filters - QuestionFilters for subject, topic, subtopic, status, difficulty, cursor, limit.
 * @returns Object containing { questions, isLoading, isError, nextCursor } and helper properties.
 *
 * @example
 * ```tsx
 * const { questions, isLoading, isError, nextCursor } = useQuestions({
 *   status: 'PENDING_REVIEW',
 *   limit: 50,
 * });
 * ```
 */
export function useQuestions(
  filters: QuestionFilters = {},
  options?: { enabled?: boolean },
): UseQuestionsResult {
  const query = useQuery<QuestionListResponse, Error>({
    queryKey: ['questions', filters],
    queryFn: () => listQuestions(filters),
    enabled: options?.enabled ?? true,
  });

  return {
    questions: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    nextCursor: query.data?.nextCursor,
    refetch: query.refetch,
    query,
  };
}

/**
 * Hook to fetch questions using cursor-based infinite scroll for the taxonomy browser.
 *
 * @param filters - QuestionFilters without the cursor parameter.
 * @returns TanStack Query infinite query result with helper data access.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuestionsInfinite({
 *   subtopicId: 'subtopic-123',
 * });
 * ```
 */
export function useQuestionsInfinite(
  filters: Omit<QuestionFilters, 'cursor'> = {},
) {
  return useInfiniteQuery<QuestionListResponse, Error>({
    queryKey: ['questions', 'infinite', filters],
    queryFn: ({ pageParam }) =>
      listQuestions({
        ...filters,
        cursor: (pageParam as string | undefined) || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export default useQuestions;
