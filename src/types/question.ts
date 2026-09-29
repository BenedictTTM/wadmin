import { z } from 'zod';

// ============================================================================
// Enums & Primitive Domain Types
// ============================================================================

export type QuestionStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER';

export interface QuestionOption {
  key: string;
  text: string;
}

// ============================================================================
// Core Domain Models
// ============================================================================

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOption: string;
  explanation?: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  status: QuestionStatus;
  rejectionReason?: string;
  subtopicId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  hasFlashCard: boolean; // Computed by backend (_count)
  subtopic?: {
    id: string;
    name: string;
    topic?: {
      id: string;
      name: string;
      subject?: {
        id: string;
        name: string;
      };
    };
  };
  author?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface QuestionListResponse {
  data: Question[];
  nextCursor?: string;
  total: number;
}

export interface QuestionFilters {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  status?: QuestionStatus;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  search?: string;
  cursor?: string;
  limit?: number;
}

// ============================================================================
// DTOs for Mutations
// ============================================================================

export interface CreateQuestionDto {
  text: string;
  options: QuestionOption[];
  correctOption: string;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  subtopicId: string;
  createFlashcard?: boolean;
}

export interface UpdateQuestionDto {
  text?: string;
  options?: QuestionOption[];
  correctOption?: string;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  type?: QuestionType;
  subtopicId?: string;
}

export interface RejectQuestionDto {
  reason: string;
}

// ============================================================================
// Audit Log Domain Types
// ============================================================================

export interface AuditLogEntry {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  questionId?: string;
  actorId?: string;
  actor?: {
    id: string;
    name: string;
    email: string;
  };
  details?: Record<string, unknown> | string;
  reason?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  questionId?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogResponse {
  data: AuditLogEntry[];
  total?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// Zod Runtime Validation Schemas
// ============================================================================

export const questionStatusSchema = z.enum([
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'ARCHIVED',
]);

export const questionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const questionTypeSchema = z.enum(['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER']);

export const questionOptionSchema = z.object({
  key: z.string().min(1, 'Option key is required'),
  text: z.string().min(1, 'Option text is required'),
});

export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  options: z.array(questionOptionSchema),
  correctOption: z.string().min(1),
  explanation: z.string().optional(),
  difficulty: questionDifficultySchema,
  type: questionTypeSchema,
  status: questionStatusSchema,
  rejectionReason: z.string().optional(),
  subtopicId: z.string(),
  authorId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().optional(),
  hasFlashCard: z.boolean(),
  subtopic: z
    .object({
      id: z.string(),
      name: z.string(),
      topic: z
        .object({
          id: z.string(),
          name: z.string(),
          subject: z
            .object({
              id: z.string(),
              name: z.string(),
            })
            .optional(),
        })
        .optional(),
    })
    .optional(),
  author: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    })
    .optional(),
});

export const questionListResponseSchema = z.object({
  data: z.array(questionSchema),
  nextCursor: z.string().optional(),
  total: z.number(),
});

export const questionFiltersSchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
  subtopicId: z.string().optional(),
  status: questionStatusSchema.optional(),
  difficulty: questionDifficultySchema.optional(),
  type: questionTypeSchema.optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().positive().optional(),
});

export const createQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  options: z.array(questionOptionSchema).min(2, 'At least 2 options are required'),
  correctOption: z.string().min(1, 'Correct option key is required'),
  explanation: z.string().optional(),
  difficulty: questionDifficultySchema.default('MEDIUM'),
  type: questionTypeSchema.default('MCQ'),
  subtopicId: z.string().min(1, 'Subtopic is required'),
});

export const updateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  options: z.array(questionOptionSchema).min(2).optional(),
  correctOption: z.string().min(1).optional(),
  explanation: z.string().optional(),
  difficulty: questionDifficultySchema.optional(),
  type: questionTypeSchema.optional(),
  subtopicId: z.string().optional(),
});

export const rejectQuestionSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required').max(1000),
});

export const auditLogFiltersSchema = z.object({
  questionId: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
});

export const auditLogEntrySchema = z.object({
  id: z.string(),
  action: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  questionId: z.string().optional(),
  actorId: z.string().optional(),
  actor: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    })
    .optional(),
  details: z.union([z.record(z.unknown()), z.string()]).optional(),
  reason: z.string().optional(),
  createdAt: z.string(),
});

export const auditLogResponseSchema = z.object({
  data: z.array(auditLogEntrySchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});
