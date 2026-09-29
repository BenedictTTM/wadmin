import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { getAuditLog } from '../api/audit';
import type {
  AuditLogFilters,
  AuditLogResponse,
} from '../types/question';

/**
 * Parameter configuration for useAuditLog.
 */
export interface UseAuditLogParams extends AuditLogFilters {
  enabled?: boolean;
}

/**
 * Hook to fetch paginated audit log entries.
 * Can be called with either a questionId string or a filter object containing { questionId, page, limit }.
 * Query key: ['audit-log', questionId] or ['audit-log', filters]
 *
 * @param questionIdOrFilters - Question UUID string or full filter object.
 * @param pageParam - Optional page number (when passing string questionId).
 * @param limitParam - Optional page size limit (when passing string questionId).
 * @returns TanStack Query result for audit log data with keepPreviousData pagination.
 *
 * @example
 * ```tsx
 * // Fetch logs for a specific question
 * const { data, isLoading } = useAuditLog(questionId);
 *
 * // Fetch paginated system-wide audit logs
 * const { data, isLoading } = useAuditLog({ page: 1, limit: 25 });
 * ```
 */
export function useAuditLog(
  questionIdOrFilters?: string | UseAuditLogParams,
  pageParam?: number,
  limitParam?: number,
): UseQueryResult<AuditLogResponse, Error> {
  const isStringId = typeof questionIdOrFilters === 'string';
  const filters: AuditLogFilters = isStringId
    ? { questionId: questionIdOrFilters, page: pageParam, limit: limitParam }
    : questionIdOrFilters ?? {};

  const enabled =
    typeof questionIdOrFilters === 'object' && questionIdOrFilters?.enabled !== undefined
      ? questionIdOrFilters.enabled
      : true;

  return useQuery<AuditLogResponse, Error>({
    queryKey: ['audit-log', filters.questionId, filters.page, filters.limit],
    queryFn: () => getAuditLog(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/**
 * Hook to fetch audit logs using infinite scrolling.
 *
 * Query key: ['audit-log', 'infinite', questionId]
 *
 * @param questionId - Optional question ID to filter logs.
 * @param limit - Optional limit per page (defaults to 25).
 * @returns TanStack Query infinite query result.
 *
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useAuditLogInfinite(questionId);
 * ```
 */
export function useAuditLogInfinite(
  questionId?: string,
  limit = 25,
) {
  return useInfiniteQuery<AuditLogResponse, Error>({
    queryKey: ['audit-log', 'infinite', questionId, limit],
    queryFn: ({ pageParam }) =>
      getAuditLog({
        questionId,
        page: pageParam as number,
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentFetched = allPages.length * limit;
      if (lastPage.total && currentFetched < lastPage.total) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });
}

export default useAuditLog;
