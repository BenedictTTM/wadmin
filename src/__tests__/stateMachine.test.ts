import { describe, expect, it } from 'vitest';
import { getValidActions } from '../lib/questionStateMachine';

describe('Question Lifecycle State Machine Coverage', () => {
  describe('DRAFT Status Transitions', () => {
    it('allows Admin, Teacher, and Content Developer to VIEW, EDIT, SUBMIT, and DELETE draft questions', () => {
      const adminActions = getValidActions('DRAFT', 'ADMIN');
      const teacherActions = getValidActions('DRAFT', 'TEACHER');
      const developerActions = getValidActions('DRAFT', 'CONTENT_DEVELOPER');

      expect(adminActions).toEqual(
        expect.arrayContaining(['VIEW', 'EDIT', 'SUBMIT_FOR_REVIEW', 'DELETE']),
      );
      expect(teacherActions).toEqual(
        expect.arrayContaining(['VIEW', 'EDIT', 'SUBMIT_FOR_REVIEW', 'DELETE']),
      );
      expect(developerActions).toEqual(
        expect.arrayContaining(['VIEW', 'EDIT', 'SUBMIT_FOR_REVIEW', 'DELETE']),
      );
    });

    it('blocks APPROVE, REJECT, and ARCHIVE actions on DRAFT questions for all roles', () => {
      const adminActions = getValidActions('DRAFT', 'ADMIN');
      const teacherActions = getValidActions('DRAFT', 'TEACHER');

      expect(adminActions).not.toContain('APPROVE');
      expect(adminActions).not.toContain('REJECT');
      expect(adminActions).not.toContain('ARCHIVE');

      expect(teacherActions).not.toContain('APPROVE');
      expect(teacherActions).not.toContain('REJECT');
      expect(teacherActions).not.toContain('ARCHIVE');
    });
  });

  describe('PENDING_REVIEW Status Transitions', () => {
    it('allows Admin to APPROVE, REJECT, EDIT, and DELETE pending questions', () => {
      const adminActions = getValidActions('PENDING_REVIEW', 'ADMIN');
      expect(adminActions).toContain('APPROVE');
      expect(adminActions).toContain('REJECT');
      expect(adminActions).toContain('EDIT');
      expect(adminActions).toContain('DELETE');
      expect(adminActions).toContain('VIEW');
      expect(adminActions).not.toContain('SUBMIT_FOR_REVIEW');
      expect(adminActions).not.toContain('ARCHIVE');
    });

    it('locks EDIT, APPROVE, REJECT, and DELETE for Teacher and Content Developer while under review', () => {
      const teacherActions = getValidActions('PENDING_REVIEW', 'TEACHER');
      const devActions = getValidActions('PENDING_REVIEW', 'CONTENT_DEVELOPER');

      expect(teacherActions).toEqual(['VIEW']);
      expect(devActions).toEqual(['VIEW']);
    });
  });

  describe('PUBLISHED Status Transitions', () => {
    it('allows Admin to ARCHIVE and EDIT published questions, but blocks APPROVE, REJECT, and DELETE', () => {
      const adminActions = getValidActions('PUBLISHED', 'ADMIN');
      expect(adminActions).toContain('ARCHIVE');
      expect(adminActions).toContain('EDIT');
      expect(adminActions).toContain('VIEW');
      expect(adminActions).not.toContain('APPROVE');
      expect(adminActions).not.toContain('REJECT');
      expect(adminActions).not.toContain('DELETE');
    });

    it('restricts non-admin roles to read-only VIEW on published questions', () => {
      const teacherActions = getValidActions('PUBLISHED', 'TEACHER');
      expect(teacherActions).toEqual(['VIEW']);
    });
  });

  describe('REJECTED Status Transitions', () => {
    it('allows authors and admins to EDIT and re-SUBMIT rejected questions', () => {
      const teacherActions = getValidActions('REJECTED', 'TEACHER');
      const adminActions = getValidActions('REJECTED', 'ADMIN');

      expect(teacherActions).toEqual(
        expect.arrayContaining(['VIEW', 'EDIT', 'SUBMIT_FOR_REVIEW', 'DELETE']),
      );
      expect(adminActions).toEqual(
        expect.arrayContaining(['VIEW', 'EDIT', 'SUBMIT_FOR_REVIEW', 'DELETE']),
      );
      expect(teacherActions).not.toContain('APPROVE');
      expect(teacherActions).not.toContain('ARCHIVE');
    });
  });

  describe('ARCHIVED Status Transitions', () => {
    it('marks archived questions as immutable for editing and submitting', () => {
      const adminActions = getValidActions('ARCHIVED', 'ADMIN');
      const teacherActions = getValidActions('ARCHIVED', 'TEACHER');

      expect(adminActions).toContain('VIEW');
      expect(adminActions).toContain('DELETE');
      expect(adminActions).not.toContain('EDIT');
      expect(adminActions).not.toContain('SUBMIT_FOR_REVIEW');

      expect(teacherActions).toEqual(['VIEW']);
    });
  });
});
