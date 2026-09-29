# Question Bank Admin Panel — Quality Assurance Scratchpad & Quality Gate

**Document Version**: 1.0.0  
**Target Application**: Next.js 14 App Router Admin Panel (`admin/`)  
**Scope**: Phases 1–7 QA Validation & State Machine Verification

---

## 1. STATE MACHINE COVERAGE MATRIX

Legend:
- ✅ **Allowed**: Transition permitted for authorized actors.
- ❌ **Blocked**: Invalid lifecycle transition rejected by validation and API.
- 🔒 **Role-gated**: Permitted only for users with the `ADMIN` role.

| Current Status \ Action | VIEW | EDIT | SUBMIT_FOR_REVIEW | APPROVE | REJECT | ARCHIVE | DELETE |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **DRAFT** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **PENDING_REVIEW** | ✅ | 🔒 | ❌ | 🔒 | 🔒 | ❌ | 🔒 |
| **PUBLISHED** | ✅ | 🔒 | ❌ | ❌ | ❌ | 🔒 | ❌ |
| **REJECTED** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **ARCHIVED** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 🔒 |

---

## 2. ROLE × ACTION ACCESS MATRIX

Legend:
- ✅ **Granted**: Full endpoint permission.
- ⚠️ **Conditional**: Allowed for question author / owner while question is in `DRAFT` or `REJECTED` status.
- ❌ **Forbidden**: Returns HTTP 403 Forbidden / UI element hidden.

| API Endpoint | Method | ADMIN | TEACHER | CONTENT_DEVELOPER |
| :--- | :---: | :---: | :---: | :---: |
| `/questions` (List Raw Bank) | `GET` | ✅ | ✅ | ✅ |
| `/questions/:id` (Fetch Question) | `GET` | ✅ | ✅ | ✅ |
| `/questions` (Create Draft) | `POST` | ✅ | ✅ | ✅ |
| `/questions/:id` (Update Question) | `PATCH` | ✅ | ⚠️ (Owner-only) | ⚠️ (Owner-only) |
| `/questions/:id` (Delete Question) | `DELETE` | ✅ | ⚠️ (Owner-only) | ⚠️ (Owner-only) |
| `/questions/:id/submit-for-review` | `POST` | ✅ | ⚠️ (Owner-only) | ⚠️ (Owner-only) |
| `/questions/:id/approve` | `POST` | ✅ | ❌ | ❌ |
| `/questions/:id/reject` | `POST` | ✅ | ❌ | ❌ |
| `/questions/:id/archive` | `POST` | ✅ | ❌ | ❌ |
| `/subjects` (List Subjects) | `GET` | ✅ | ✅ | ✅ |
| `/topics?subjectId=` (List Topics) | `GET` | ✅ | ✅ | ✅ |
| `/subtopics?topicId=` (List Subtopics) | `GET` | ✅ | ✅ | ✅ |
| `/audit-log` (Audit Event Log) | `GET` | ✅ | ❌ | ❌ |

---

## 3. UI CHECKLIST — Per Screen

### Taxonomy Browser (`/questions`)
- [x] Subject column loads on initial mount (`GET /subjects`).
- [x] Selecting a subject populates the topic column (`GET /topics?subjectId=`); clears subtopic column and question list.
- [x] Selecting a topic populates the subtopic column (`GET /subtopics?topicId=`); clears question list.
- [x] Selecting a subtopic loads question list for that subtopic only (`GET /questions?subtopicId=`).
- [x] `FlashCardIndicator` shows teal Zap icon when `hasFlashCard === true`, gray Dash icon when `false`.
- [x] Search input in top bar overrides taxonomy filters and displays global search results.
- [x] Empty states cleanly rendered when no data exists at Subject, Topic, Subtopic, or Question level.
- [x] "Load more questions" button loads next cursor page via `useQuestionsInfinite()`.
- [x] Actions dropdown menu shows only valid operations based on current question status and viewer role.
- [x] "+ New Question" button navigates directly to `/questions/new`.

### Question Editor (`/questions/new` & `/questions/:id/edit`)
- [x] Taxonomy selector cascades correctly (Topic select disabled until Subject chosen; Subtopic disabled until Topic chosen).
- [x] Changing question type to `TRUE_FALSE` auto-populates `True`/`False` options and hides dynamic OptionsBuilder.
- [x] Changing question type to `SHORT_ANSWER` hides options builder and sets text answer key.
- [x] `MCQ` options builder permits between 2 and 4 options; requires correct option radio button selection.
- [x] Zod schema validation blocks submission if question prompt text is shorter than 10 characters.
- [x] `RejectionReasonBanner` callout box appears at the top of the form only when `status === 'REJECTED'`.
- [x] "Save Draft" triggers mutation, persists without status transition, and triggers success toast.
- [x] "Submit for Review" saves draft first, transitions question to `PENDING_REVIEW`, shows toast, and redirects to `/questions`.

### Review Queue (`/review`)
- [x] List queries and displays only questions in `PENDING_REVIEW` status.
- [x] Selecting a list item displays full question preview in the right pane.
- [x] Correct answer is prominently highlighted in green with checkmark icon in the options preview.
- [x] Flash card badge indicator is displayed in the preview card header.
- [x] Clicking "Approve ✓" optimistically removes item from list and triggers success toast.
- [x] Clicking "Reject ✗" opens `RejectModal`; submit button remains disabled until textarea has ≥ 10 characters.
- [x] Submitting rejection optimistically removes item from queue and updates question status.
- [x] Non-admin viewers (`isAdmin === false`) see read-only banner: *"Only admins can approve or reject questions."*

### Audit Log (`/audit`)
- [x] Table loads with all columns: Timestamp, Action, Question Preview, Performed By, Detail.
- [x] Action chip colours render accurately: `QUESTION_APPROVED` (emerald green), `QUESTION_REJECTED` (rose red), `QUESTION_ARCHIVED` (slate gray).
- [x] Single-row filter bar narrows results by action select, date range (`From` / `To` popover calendar), and Question ID search.
- [x] Numbered pagination controls transition smoothly between pages (25 rows/page) and reflect correct total event counts.
- [x] Empty state displays *"No audit events yet"* with clock SVG icon when no records match.

---

## 4. EDGE CASES TO MANUALLY VERIFY

1. **Double Approval**: Attempt to approve a question that has already been approved in another tab (expect HTTP 400 Bad Request error handled gracefully by toast).
2. **Editing Published Question**: Attempt to edit a `PUBLISHED` question as a non-admin (expect edit button hidden; direct URL navigation guarded with 403 error).
3. **Submit from Archived**: Attempt to submit for review from `ARCHIVED` status (button must remain hidden and disabled).
4. **Deleting Published Question**: Attempt to delete a `PUBLISHED` question (delete action omitted from dropdown; backend returns HTTP 403 Forbidden).
5. **Network Failure During Mutation**: Disconnect network and click "Approve" (optimistic removal must revert, restoring item to list with error toast notification).
6. **Orphaned Subtopic**: Question without associated subtopic metadata renders graceful fallback in breadcrumbs (`"General"` or `"Uncategorized"`).
7. **LaTeX Expressions**: Questions containing math formulas like `$x^2 + \sqrt{y} = z$` render plain text cleanly without crashing React tree.
8. **Flash Card Deletion Sync**: Flash card deleted in backend results in `FlashCardIndicator` updating from teal Zap to gray Dash upon refetch.

---

## 5. KNOWN GAPS (FUTURE TICKETS)

1. **LaTeX / MathJax Rendering**: Add KaTeX/MathJax rendering in `QuestionPreviewCard` and `QuestionEditor` preview mode.
2. **Bulk Review Operations**: Support multi-select checkboxes in `ReviewQueue` for batch approving/rejecting questions.
3. **Integrated Flash Card Authoring**: Direct flash card generation and AI quiz distillation flow from within the Question Editor.
4. **Student Quiz Preview Mode**: Interactive modal simulating the student exam environment and timer experience.
5. **Analytics & KPI Dashboard**: Executive dashboard with high-level summary cards (questions per status, per subject breakdown, review velocity metrics).
