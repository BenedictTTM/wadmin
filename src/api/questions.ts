import apiClient from '../lib/axios';
import type {
  CreateQuestionDto,
  Question,
  QuestionFilters,
  QuestionListResponse,
  UpdateQuestionDto,
} from '../types/question';

/**
 * Fetch a paginated list of questions with optional taxonomy, status, and difficulty filters.
 * GET /questions
 */
export async function listQuestions(
  filters?: QuestionFilters,
): Promise<QuestionListResponse> {
  const response = await apiClient.get<QuestionListResponse>('/questions', {
    params: filters,
  });
  return response.data;
}

/**
 * Fetch a single question by ID.
 * GET /questions/:id
 */
export async function getQuestion(id: string): Promise<Question> {
  const response = await apiClient.get<Question>(`/questions/${id}`);
  return response.data;
}

/**
 * Create a new question in DRAFT status.
 * POST /questions
 */
export async function createQuestion(
  dto: CreateQuestionDto,
): Promise<Question> {
  const response = await apiClient.post<Question>('/questions', dto);
  return response.data;
}

/**
 * Update an existing question (owner while DRAFT, or admin/content manager).
 * PATCH /questions/:id
 */
export async function updateQuestion(
  id: string,
  dto: UpdateQuestionDto,
): Promise<Question> {
  const response = await apiClient.patch<Question>(`/questions/${id}`, dto);
  return response.data;
}

/**
 * Delete / soft-delete a question by ID.
 * DELETE /questions/:id
 */
export async function deleteQuestion(id: string): Promise<void> {
  await apiClient.delete<void>(`/questions/${id}`);
}

/**
 * Submit a draft question for admin review (DRAFT → PENDING_REVIEW).
 * POST /questions/:id/submit-for-review
 */
export async function submitForReview(id: string): Promise<Question> {
  const response = await apiClient.post<Question>(
    `/questions/${id}/submit-for-review`,
  );
  return response.data;
}

/**
 * Approve a pending question (PENDING_REVIEW → PUBLISHED).
 * POST /questions/:id/approve
 */
export async function approveQuestion(id: string): Promise<Question> {
  const response = await apiClient.post<Question>(
    `/questions/${id}/approve`,
  );
  return response.data;
}

/**
 * Reject a pending question with a required rejection reason (PENDING_REVIEW → REJECTED).
 * POST /questions/:id/reject
 */
export async function rejectQuestion(
  id: string,
  reason: string,
): Promise<Question> {
  const response = await apiClient.post<Question>(
    `/questions/${id}/reject`,
    { reason },
  );
  return response.data;
}

/**
 * Archive an existing published question (PUBLISHED → ARCHIVED).
 * POST /questions/:id/archive
 */
export async function archiveQuestion(id: string): Promise<Question> {
  const response = await apiClient.post<Question>(
    `/questions/${id}/archive`,
  );
  return response.data;
}
