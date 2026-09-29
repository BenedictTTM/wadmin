import { z } from 'zod';

// ============================================================================
// Core Taxonomy Domain Types
// ============================================================================

export interface Subject {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  topics?: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  slug?: string;
  subjectId: string;
  createdAt?: string;
  updatedAt?: string;
  subject?: Subject;
  subtopics?: Subtopic[];
}

export interface Subtopic {
  id: string;
  name: string;
  slug?: string;
  topicId: string;
  createdAt?: string;
  updatedAt?: string;
  topic?: Topic;
}

// ============================================================================
// Query Parameters & Mutation DTOs
// ============================================================================

export interface TopicFilters {
  subjectId?: string;
}

export interface SubtopicFilters {
  topicId?: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  slug: string;
  description?: string;
}

export interface CreateTopicDto {
  name: string;
  slug: string;
  subjectId: string;
}

export interface CreateSubtopicDto {
  name: string;
  slug: string;
  topicId: string;
}

// ============================================================================
// Zod Runtime Validation Schemas
// ============================================================================

export const subjectSchema: z.ZodType<Subject> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().min(1),
    code: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    topics: z.array(topicSchema).optional(),
  }),
);

export const topicSchema: z.ZodType<Topic> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().min(1),
    slug: z.string().optional(),
    subjectId: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    subject: subjectSchema.optional(),
    subtopics: z.array(subtopicSchema).optional(),
  }),
);

export const subtopicSchema: z.ZodType<Subtopic> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().min(1),
    slug: z.string().optional(),
    topicId: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    topic: topicSchema.optional(),
  }),
);
