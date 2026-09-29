# Question Bank Admin Panel — QA Quality Gate Checklist (Phases 1–6)

This document provides a self-contained quality assurance checklist and verification protocol across all modules of the Question Bank admin panel.

---

## 1. Phase 1 — Foundation & Types
- [ ] **Domain Model Integrity**: Verify `Question`, `QuestionOption`, `QuestionListResponse`, `QuestionFilters` in `src/types/question.ts`.
- [ ] **Curriculum Taxonomy**: Verify `Subject`, `Topic`, `Subtopic` in `src/types/taxonomy.ts`.
- [ ] **Tailwind Design Constants**: Confirm `StatusMeta`, `DifficultyMeta`, and `TypeMeta` in `src/constants/question.ts` use exact Tailwind color strings.
- [ ] **Axios Interceptor**:
  - [ ] Reads `NEXT_PUBLIC_API_URL` with default fallback to `http://localhost:3000`.
  - [ ] Extracts `access_token` from `localStorage` in browser runtime.
  - [ ] Attaches `Authorization: Bearer <token>` to request headers.
- [ ] **React Query Singleton Client**:
  - [ ] Configured with `staleTime: 30000` (30s), `retry: 1`, `refetchOnWindowFocus: false`.
  - [ ] Browser-safe singleton getter `getQueryClient()` prevents re-creation during re-renders.

---

## 2. Phase 2 — React Query Hooks Layer
- [ ] **`useQuestions`**: Returns `{ questions, total, isLoading, isError, nextCursor }` using query key `['questions', filters]`.
- [ ] **`useQuestionsInfinite`**: Cursor-based infinite scrolling on `['questions', 'infinite', filters]` with `getNextPageParam`.
- [ ] **`useQuestion`**: Fetches single question by ID; query is disabled when ID is null/undefined.
- [ ] **`useTaxonomy`**: Composed 3-way cascading queries:
  - [ ] `subjects` from `['subjects']`
  - [ ] `topics` from `['topics', subjectId]` (enabled only when `subjectId` is provided)
  - [ ] `subtopics` from `['subtopics', topicId]` (enabled only when `topicId` is provided)
- [ ] **`useQuestionMutations`**:
  - [ ] Returns individual mutation objects: `createMutation`, `updateMutation`, `deleteMutation`, `submitForReviewMutation`, `approveMutation`, `rejectMutation`, `archiveMutation`.
  - [ ] Each mutation automatically invalidates `['questions']` and `['question', id]` on success.
  - [ ] Handles optional `onError` callback.
- [ ] **`useAuditLog`**: Paginated query using `placeholderData: keepPreviousData` on `['audit-log', questionId, page, limit]`.

---

## 3. Phase 3 — Taxonomy Drill-Down Navigation Shell
- [ ] **Finder-Style 3-Column Shell**:
  - [ ] `SubjectColumn`: `200px` fixed width with subject codes.
  - [ ] `TopicColumn`: `220px` fixed width; displays placeholder until subject selected.
  - [ ] `SubtopicColumn`: `240px` fixed width; displays placeholder until topic selected.
  - [ ] `QuestionListPanel`: Fills remaining width.
- [ ] **Cascade Clearing**:
  - [ ] Selecting Subject clears selected Topic and Subtopic.
  - [ ] Selecting Topic clears selected Subtopic.
- [ ] **Selected Item Indicator**: Active item displays `border-l-4 border-indigo-600 bg-indigo-50/80`.
- [ ] **Mobile Experience**:
  - [ ] Displays interactive breadcrumbs (`Subjects › Topic › Subtopic › Questions`).
  - [ ] Single panel rendered at a time.
- [ ] **Question Row Badges & Actions**:
  - [ ] Flash card indicator (Zap teal / Minus slate with tooltip).
  - [ ] Type, difficulty, and status badges.
  - [ ] Actions menu filtered strictly by status and viewer role (`ADMIN`, `TEACHER`, `CONTENT_DEVELOPER`).

---

## 4. Phase 4 — Question Editor Form
- [ ] **Schema & Validation (`QuestionFormSchema`)**:
  - [ ] `subtopicId`: Required string.
  - [ ] `type`: `MCQ`, `TRUE_FALSE`, `SHORT_ANSWER`.
  - [ ] `difficulty`: `EASY`, `MEDIUM`, `HARD`.
  - [ ] `text`: 10–2000 characters with LaTeX `$…$` guidance.
  - [ ] `options`: Min 2, max 4 options for MCQ; auto-sets True/False; clears for Short Answer.
  - [ ] `correctOption`: Required key matching one of the options.
- [ ] **Dynamic `OptionsBuilder`**:
  - [ ] Four rows (A, B, C, D) with radio selector for correct answer.
  - [ ] "Add Option" disabled at 4 options.
  - [ ] "Remove Option" disabled at 2 options.
  - [ ] Automatically re-assigns correct option if deleted.
- [ ] **Taxonomy Selector**: Three cascading select dropdowns resetting downstream selections on change.
- [ ] **Rejection Banner**: Red callout box with `rejectionReason` rendered in edit mode when `status === 'REJECTED'`.
- [ ] **Save vs Submit Actions**:
  - [ ] "Save Draft": Saves without submitting for review.
  - [ ] "Submit for Review": Saves draft and transitions status to `PENDING_REVIEW`, redirects to `/questions`.

---

## 5. Phase 5 — Admin Review Queue
- [ ] **Layout**: Left column `360px` fixed | right column question preview.
- [ ] **Pending List**:
  - [ ] Queries `status: 'PENDING_REVIEW'`, limit 50.
  - [ ] Displays author avatar initials, 60-char truncated question text, taxonomy breadcrumb, and relative time.
  - [ ] Selected item styled with `border-l-4 border-indigo-600 bg-indigo-50/80`.
  - [ ] Empty state displays `"Queue is clear ✓"` with green check illustration.
- [ ] **Question Preview Card**:
  - [ ] Full text, options with highlighted correct answer, explanation box, author chip, date, large flashcard badge.
  - [ ] Sticky bottom action bar.
- [ ] **Role Guard**: If `isAdmin === false`, action bar replaced with read-only notice: `"Only admins can approve or reject questions."`
- [ ] **Optimistic UI**: Immediate removal of approved/rejected questions from list; state restored if mutation fails.
- [ ] **Reject Modal**: Dialog with textarea requiring `>= 10` characters before enabling Reject button.

---

## 6. Phase 6 — Audit Log Table
- [ ] **Table Columns**:
  - [ ] Timestamp: formatted `DD MMM YYYY, HH:mm` via built-in `Intl.DateTimeFormat`.
  - [ ] Action: Colored badge (Approved → green, Rejected → red, Archived → slate).
  - [ ] Question Preview: Truncated to 60 chars linking to `/questions/:id`.
  - [ ] Performed by: Admin name + role chip.
  - [ ] Detail: Rejection reason if action is rejected, else `—`.
- [ ] **Filters**: Single-row filters for action select, date range picker (`Popover` + `Calendar`), and question ID search input.
- [ ] **Pagination**: Numbered 25 rows per page with `"Showing X–Y of Z events"` summary.
- [ ] **Empty State**: Displays `"No audit events yet"` with small clock SVG icon.
