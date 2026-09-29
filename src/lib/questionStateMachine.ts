import type { QuestionStatus } from '../types/question';

export type Role = 'ADMIN' | 'TEACHER' | 'CONTENT_DEVELOPER';

export type Action =
  | 'VIEW'
  | 'EDIT'
  | 'SUBMIT_FOR_REVIEW'
  | 'APPROVE'
  | 'REJECT'
  | 'ARCHIVE'
  | 'DELETE';

/**
 * Valid action mappings per status.
 * Maps QuestionStatus -> Action -> Array of authorized Roles.
 */
export const VALID_TRANSITIONS: Record<
  QuestionStatus,
  Partial<Record<Action, Role[]>>
> = {
  DRAFT: {
    VIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    EDIT: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    SUBMIT_FOR_REVIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    DELETE: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
  },
  PENDING_REVIEW: {
    VIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    EDIT: ['ADMIN'],
    APPROVE: ['ADMIN'],
    REJECT: ['ADMIN'],
    DELETE: ['ADMIN'],
  },
  PUBLISHED: {
    VIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    EDIT: ['ADMIN'],
    ARCHIVE: ['ADMIN'],
  },
  REJECTED: {
    VIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    EDIT: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    SUBMIT_FOR_REVIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    DELETE: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
  },
  ARCHIVED: {
    VIEW: ['ADMIN', 'TEACHER', 'CONTENT_DEVELOPER'],
    DELETE: ['ADMIN'],
  },
};

/**
 * Pure data function: returns the actions the given role may perform
 * on a question in the given status.
 *
 * @param status - The current lifecycle status of the question.
 * @param role - The viewer's assigned user role.
 * @returns Array of allowed actions for this role and status.
 */
export function getValidActions(
  status: QuestionStatus,
  role: Role,
): Action[] {
  const statusActions = VALID_TRANSITIONS[status];
  if (!statusActions) return [];

  const validActions: Action[] = [];

  for (const [actionKey, allowedRoles] of Object.entries(statusActions)) {
    const action = actionKey as Action;
    if (allowedRoles && allowedRoles.includes(role)) {
      validActions.push(action);
    }
  }

  return validActions;
}
