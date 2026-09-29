import type {
  QuestionDifficulty,
  QuestionStatus,
  QuestionType,
} from '../types/question';

// ============================================================================
// Metadata Interfaces
// ============================================================================

export interface BadgeMeta {
  label: string;
  color: string;
  bg: string;
}

export interface TypeMetaItem {
  label: string;
}

// ============================================================================
// Status, Difficulty, and Type Metadata Maps
// ============================================================================

export const StatusMeta: Record<QuestionStatus, { label: string; color: string; bg: string }> = {
  DRAFT: {
    label: 'Draft',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  PENDING_REVIEW: {
    label: 'Pending Review',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  PUBLISHED: {
    label: 'Published',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
  },
  ARCHIVED: {
    label: 'Archived',
    color: 'text-zinc-600',
    bg: 'bg-zinc-100',
  },
};

export const DifficultyMeta: Record<
  QuestionDifficulty,
  { label: string; color: string; bg: string }
> = {
  EASY: {
    label: 'Easy',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  MEDIUM: {
    label: 'Medium',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  HARD: {
    label: 'Hard',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
  },
};

export const TypeMeta: Record<QuestionType, { label: string }> = {
  MCQ: {
    label: 'Multiple Choice',
  },
  TRUE_FALSE: {
    label: 'True / False',
  },
  SHORT_ANSWER: {
    label: 'Short Answer',
  },
};
