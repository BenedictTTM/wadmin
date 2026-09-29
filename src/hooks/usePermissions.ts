/**
 * usePermissions — central RBAC hook for the admin portal.
 *
 * Computes per-action booleans from the authenticated user's role and,
 * where relevant, the ownership / status of a specific question.
 * All UI components must derive their action visibility from this hook so
 * that permission logic stays in ONE place.
 */
import { useAuth } from '../context/AuthContext';
import type { Question } from '../types/question';

export type AppRole =
  | 'ADMIN'
  | 'CONTENT_DEVELOPER'
  | 'TEACHER'
  | 'SCHOOL_ADMIN'
  | 'GUEST'
  | 'STUDENT';

/** Statuses that a non-privileged author may edit their own question */
const EDITABLE_STATUSES_NON_ADMIN = ['DRAFT', 'REJECTED'] as const;

export function usePermissions(question?: Question | null) {
  const { user } = useAuth();
  const role = (user?.role ?? 'GUEST') as AppRole;

  // ── Role checks ──────────────────────────────────────────────────────────
  const isAdmin = role === 'ADMIN';
  const isContentDeveloper = role === 'CONTENT_DEVELOPER';
  const isTeacher = role === 'TEACHER';
  const isStaff = isAdmin || isContentDeveloper || isTeacher;

  // ── Ownership check (when a question is provided) ─────────────────────
  const isOwner = !!question && !!user && question.authorId === user.id;

  // ── Question-level action permissions ────────────────────────────────────

  /**
   * Can see and browse the question bank list
   */
  const canListQuestions = isStaff;

  /**
   * Can create new questions
   */
  const canCreateQuestion = isStaff;

  /**
   * Can EDIT a specific question.
   * - ADMIN / CONTENT_DEVELOPER: any question, any status
   * - TEACHER: own questions only, DRAFT or REJECTED status only
   */
  const canEditQuestion = (() => {
    if (!question) return isStaff;
    if (isAdmin || isContentDeveloper) return true;
    if (isTeacher) {
      return (
        isOwner &&
        (EDITABLE_STATUSES_NON_ADMIN as readonly string[]).includes(
          question.status,
        )
      );
    }
    return false;
  })();

  /**
   * Can DELETE a specific question.
   * - ADMIN: any question
   * - CONTENT_DEVELOPER / TEACHER: own questions only
   */
  const canDeleteQuestion = (() => {
    if (!question) return isStaff;
    if (isAdmin) return true;
    return isOwner && (isContentDeveloper || isTeacher);
  })();

  /**
   * Can submit a question for review.
   * - ADMIN / CONTENT_DEVELOPER / TEACHER: own questions (or admin any)
   */
  const canSubmitForReview = (() => {
    if (!question) return isStaff;
    if (isAdmin) return true;
    return isOwner && (isContentDeveloper || isTeacher);
  })();

  /**
   * Can APPROVE questions — ADMIN only
   */
  const canApprove = isAdmin;

  /**
   * Can REJECT questions — ADMIN only
   */
  const canReject = isAdmin;

  /**
   * Can ARCHIVE questions — ADMIN only
   */
  const canArchive = isAdmin;

  /**
   * Can access the audit log
   */
  const canViewAuditLog = isAdmin || isContentDeveloper || isTeacher;

  /**
   * Can access pro analytics (cross-subject)
   */
  const canViewProAnalytics = isAdmin || isContentDeveloper || isTeacher;

  /**
   * Can manage curriculum (subjects, topics, subtopics)
   */
  const canManageCurriculum = isAdmin || isContentDeveloper;

  /**
   * Can delete a subject (ADMIN only)
   */
  const canDeleteSubject = isAdmin;

  /**
   * Can upload / replace PDFs
   */
  const canUploadPdf = isStaff;

  /**
   * Can delete PDFs (ADMIN only)
   */
  const canDeletePdf = isAdmin;

  return {
    role,
    isAdmin,
    isContentDeveloper,
    isTeacher,
    isStaff,
    isOwner,
    canListQuestions,
    canCreateQuestion,
    canEditQuestion,
    canDeleteQuestion,
    canSubmitForReview,
    canApprove,
    canReject,
    canArchive,
    canViewAuditLog,
    canViewProAnalytics,
    canManageCurriculum,
    canDeleteSubject,
    canUploadPdf,
    canDeletePdf,
  };
}

export default usePermissions;
