import apiClient from '../lib/axios';
import type { AuditLogFilters, AuditLogResponse } from '../types/question';

/**
 * Fetch audit log records, optionally filtered by questionId, page, and limit.
 * GET /audit-log
 */
export async function getAuditLog(
  filters?: AuditLogFilters,
): Promise<AuditLogResponse> {
  const response = await apiClient.get<AuditLogResponse>('/audit-log', {
    params: filters,
  });
  return response.data;
}
