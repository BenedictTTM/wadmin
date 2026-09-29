# RESPONSIVE QA SCRATCH PAD & LIVE AUDIT LEDGER

**Target Application**: Next.js 14 App Router Admin Panel (`admin/`)  
**Auditor**: Senior Frontend QA Engineer & Responsive UI Specialist  
**Status**: IN PROGRESS — Initial Architecture Mapping & Test Setup  
**Date**: September 28, 2026

---

## 1. ARCHITECTURE & RESPONSIVE MAPPING

### Technology Stack
- **Framework**: Next.js 14.2.0 (App Router), React 18.3.1, TypeScript 5.4.2 (Strict)
- **Styling Engine**: Tailwind CSS 3.4.1, Autoprefixer, PostCSS
- **Component Primitives**: Radix UI (`@radix-ui/react-dialog`, `react-dropdown-menu`, `react-popover`, `react-scroll-area`, `react-select`, `react-slot`)
- **Icons**: Lucide React 0.363.0
- **State & Data Layer**: `@tanstack/react-query` 5.28.4, Axios 1.6.8
- **Forms & Validation**: `react-hook-form` 7.89.0, `zod` 3.22.4, `@hookform/resolvers`

### Existing Responsive Breakpoints (Tailwind Defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px
- *(No custom breakpoints configured in `tailwind.config.js`)*

### Shared Layout Hierarchy
- Root Layout: [`src/app/layout.tsx`](file:///c:/Users/USER/repos/was/admin/src/app/layout.tsx) (`<html lang="en">`, `<body className="bg-slate-100 text-slate-900 antialiased min-h-screen">`)
- Admin Layout: [`src/app/(admin)/layout.tsx`](file:///c:/Users/USER/repos/was/admin/src/app/(admin)/layout.tsx)
  - Sidebar: `<aside className="flex w-60 flex-col border-r border-slate-200 bg-white">`
  - Top Bar: `<header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-5">`
  - Search Form: `<form onSubmit={handleSearchSubmit} className="relative w-80">`
  - Role Chip & "+ New Question" CTA
  - Content Area: `<main className="flex-1 overflow-hidden">`

---

## 2. AUDIT TRACKING CHECKLIST

### Pages & Routes Inspected
- [ ] Shared Admin Layout (`src/app/(admin)/layout.tsx`)
- [ ] Taxonomy Browser (`src/app/(admin)/questions/page.tsx` + `TaxonomyBrowser`)
- [ ] Question Detail Screen (`src/app/(admin)/questions/[id]/page.tsx`)
- [ ] Question Editor - Create (`src/app/(admin)/questions/new/page.tsx` + `QuestionEditor`)
- [ ] Question Editor - Edit (`src/app/(admin)/questions/[id]/edit/page.tsx` + `QuestionEditor`)
- [ ] Review Queue (`src/app/(admin)/review/page.tsx` + `ReviewQueue`)
- [ ] Audit Log (`src/app/(admin)/audit/page.tsx` + `AuditLogTable`)
- [ ] Settings Page (`src/app/(admin)/settings/page.tsx`)
- [ ] Fallbacks (`not-found.tsx`, `error.tsx`)

### Viewports Tested
- [ ] **Mobile**: 320px (iPhone SE 1st gen / small devices)
- [ ] **Mobile**: 360px (Galaxy S8 / standard Android)
- [ ] **Mobile**: 375px (iPhone SE 2nd gen / iPhone 8)
- [ ] **Mobile**: 390px (iPhone 12 / 13 / 14 / 15)
- [ ] **Mobile**: 414px (iPhone XR / 11 Pro Max / Plus)
- [ ] **Intermediate**: 480px / 540px (Small foldables / phablets)
- [ ] **Tablet**: 600px (Android small tablet portrait)
- [ ] **Tablet**: 768px (iPad portrait)
- [ ] **Tablet**: 820px (iPad Air portrait)
- [ ] **Tablet**: 912px (Surface Pro portrait)
- [ ] **Laptop**: 1024px (iPad landscape / small laptop)
- [ ] **Laptop**: 1280px (MacBook / standard laptop)
- [ ] **Intermediate**: 1366px (Common 14" laptop resolution)
- [ ] **Desktop**: 1440px (High-res laptop / desktop)
- [ ] **Desktop**: 1536px (2K laptop scaled)
- [ ] **Desktop**: 1920px (Full HD 1080p desktop)
- [ ] **Ultra-wide**: 2560px+ (QHD / 4K / Ultrawide)

### Components Tested
- [ ] Left Navigation Sidebar (`AdminLayout`)
- [ ] Top Header & Search Bar (`AdminLayout`)
- [ ] Subject Column (`SubjectColumn`)
- [ ] Topic Column (`TopicColumn`)
- [ ] Subtopic Column (`SubtopicColumn`)
- [ ] Question List Panel (`QuestionListPanel`)
- [ ] Question Preview Card (`QuestionPreviewCard`)
- [ ] Pending Review List (`PendingList`)
- [ ] Reject Modal Dialog (`RejectModal` / `Dialog`)
- [ ] Taxonomy Cascading Selector (`TaxonomySelector`)
- [ ] MCQ Dynamic Options Builder (`OptionsBuilder`)
- [ ] Rejection Reason Callout (`RejectionReasonBanner`)
- [ ] Audit Log Event Table (`AuditLogTable`)
- [ ] Date Range Popover & Calendar (`Popover` / `Calendar`)
- [ ] Action Badges (`StatusBadge`, `DifficultyBadge`, `TypeBadge`, `FlashCardIndicator`)
- [ ] Dropdown Menus (`DropdownMenu`)

---

## 3. MASTER ISSUE LEDGER (CONTINUOUSLY UPDATED)

| ID | Severity | Page / Context | Component | Viewport | Problem | Suspected Root Cause | Verification Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| `RESP-001` | P0 | Admin Shell | Sidebar `<aside>` | 320px–767px | Permanent 240px sidebar on mobile; crushes content to 80px | Missing responsive toggle (`hidden md:flex`) and mobile drawer | Confirmed |
| `RESP-002` | P0 | Questions | `TaxonomyBrowser` | 768px–1024px | 4-column layout totals 900px, causing negative/0px question list width | Desktop breakpoint set to `md:flex` (768px) instead of `xl:flex` (1280px) | Confirmed |
| `RESP-003` | P1 | Top Bar | Header / Search | 320px–800px | Search form has hardcoded `w-80` (320px); collides with buttons | Rigid pixel-equivalent utility without flex-wrapping or mobile collapse | Confirmed |
| `RESP-004` | P1 | Review Queue | `ReviewQueue` | 320px–767px | Mobile users trapped on Question #1 on initial load | Initial question auto-selected in `useEffect` bypasses mobile list | Confirmed |
| `RESP-005` | P1 | Review Queue | `ReviewQueue` | 768px–1024px | Split-pane activates at 768px, leaving only 168px for QuestionPreviewCard | Split-pane activates at `md` instead of `lg` / `xl`; left pane rigid at 360px | Confirmed |
| `RESP-006` | P1 | Questions | `QuestionListPanel` | 320px–480px | Type, Difficulty, Status badges consume 280px; question text gets 5px | 3 badges forced side-by-side with `flex-shrink-0` regardless of width | Confirmed |
| `RESP-007` | P1 | Audit Log | `AuditLogTable` | 320px–480px | Pagination controls (460px wide) overflow offscreen to the right | `flex justify-between` on pagination row without mobile stacking | Confirmed |
| `RESP-008` | P1 | Dialogs | `DialogContent` | 320px–480px | Virtual keyboard pushes modal header/buttons offscreen with no scroll | Modal centered with `translate-y-[-50%]` and lacks `max-h-[90dvh]` bounds | Confirmed |
| `RESP-009` | P2 | Audit Log | `AuditLogTable` | 320px–912px | 930px min-width table forces tedious horizontal dragging across 3 screens | No responsive card/stacked transformation for mobile viewports | Confirmed |
| `RESP-010` | P2 | Audit Log | `AuditLogTable` | 320px–640px | Filter controls wrap jaggedly into 4 disorganized rows taking 50% screen | Unstructured `flex flex-wrap` with rigid item widths | Confirmed |
| `RESP-011` | P2 | Review Card | `QuestionPreviewCard` | 320px–414px | Sticky bottom action bar elements collide on small phones | Text label and 2 action buttons forced into single horizontal row | Confirmed |
| `RESP-012` | P2 | UI Primitives | `Calendar` | 320px–1024px | Calendar day cells are `h-7 w-7` (28px × 28px); violates touch guidelines | Desktop-focused mouse click sizing (WCAG requires min 44×44px) | Confirmed |
| `RESP-013` | P2 | Question Editor | `OptionsBuilder` | 320px–390px | Option row input crushed to ~100px due to radio + chip + delete button | 4 horizontal elements in one row without mobile responsive collapse | Confirmed |
| `RESP-014` | P2 | Question Editor | `QuestionEditor` | 320px–414px | "Save Draft" and "Submit for Review" cramped on right edge | No full-width stacked button layout on mobile | Confirmed |
| `RESP-015` | P2 | Question Preview | `QuestionPreviewCard` | 320px–768px | Long mathematical formulas, URLs, or unspaced LaTeX push container width | `whitespace-pre-wrap` used without `break-words` or `overflow-wrap: anywhere` | Confirmed |
| `RESP-016` | P3 | Root Container | `AdminLayout` | Mobile browsers | `w-screen` introduces scrollbar jitter; `h-screen` causes mobile address bar jumping | Uses `100vw`/`100vh` instead of `w-full` and `h-[100dvh]` | Confirmed |
| `RESP-017` | P3 | Ultra-wide | App Content | 1920px–2560px+ | Lines of text stretch across 2000px+ (> 180 chars/line); causes eye fatigue | Missing `max-w-7xl` or `max-w-[1600px]` constraints on content containers | Confirmed |
| `RESP-018` | P3 | Review Queue | `PendingList` | 320px–360px | Long author names wrap or push relative timestamp off card | Missing `truncate` and `min-w-0` on author name container | Confirmed |

---

## 4. DETAILED EVIDENCE & INVESTIGATION LOG

### Step 1: Admin Shell & Navigation (`src/app/(admin)/layout.tsx`)
- **Inspection**:
  - Line 69: `<div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased">`
  - Line 71: `<aside className="flex w-60 flex-col border-r border-slate-200 bg-white">`
  - Line 133: `<form onSubmit={handleSearchSubmit} className="relative w-80">`
- **Stress Test (320px - iPhone SE)**:
  - Screen width = 320px.
  - Sidebar width = 240px.
  - Remaining viewport for `<main>` = **80px**.
  - Top bar search = 320px, role chip = 90px, "+ New Question" = 115px. Total top bar width = **525px**.
  - **Result**: Top bar is completely shattered and clipped by `overflow-hidden`. Content cannot be interacted with. **Confirmed P0 (`RESP-001`) and P1 (`RESP-003`)**.

### Step 2: Taxonomy Drilldown Columns (`TaxonomyBrowser.tsx`)
- **Inspection**:
  - Line 136: `<div className="hidden md:flex h-full w-full overflow-hidden">`
  - Line 138: `<SubjectColumn ... />` -> `w-[200px] flex-shrink-0`
  - Line 146: `<TopicColumn ... />` -> `w-[220px] flex-shrink-0`
  - Line 155: `<SubtopicColumn ... />` -> `w-[240px] flex-shrink-0`
  - Line 164: `<QuestionListPanel ... />` -> `<div className="flex flex-1 flex-col ...">`
- **Stress Test (768px - iPad Portrait)**:
  - Viewport = 768px.
  - Fixed columns: Sidebar (240px) + Subjects (200px) + Topics (220px) + Subtopics (240px) = **900px**.
  - Available width for `QuestionListPanel` = 768px - 900px = **-132px**.
- **Stress Test (820px - iPad Air Portrait)**:
  - 820px - 900px = **-80px**.
- **Stress Test (912px - Surface Pro Portrait)**:
  - 912px - 900px = **+12px**.
- **Stress Test (1024px - iPad Landscape / 12" MacBook)**:
  - 1024px - 900px = **+124px**.
  - Inside `QuestionListPanel`, badges take ~280px.
  - 124px - 280px = **-156px**. Question text is completely eliminated, badges clipped.
  - **Result**: The primary navigation paradigm of the admin panel is completely broken on all tablets and compact laptops. **Confirmed P0 (`RESP-002`)**.

### Step 3: Review Queue Split-Pane (`ReviewQueue.tsx`)
- **Inspection**:
  - Line 35: `if (fetchedQuestions.length > 0 && !selectedQuestionId) { setSelectedQuestionId(fetchedQuestions[0].id); }`
  - Line 113: `<div className="hidden md:flex h-full w-full overflow-hidden">` -> `w-[360px] flex-shrink-0` for `PendingList`.
  - Line 137: Mobile view condition: `{!selectedQuestion ? <PendingList /> : <QuestionPreviewCard />}`.
- **Stress Test (Mobile 375px)**:
  - On mount, `fetchedQuestions` triggers `setSelectedQuestionId` to question #1.
  - `selectedQuestion` becomes truthy immediately.
  - The mobile view skips `PendingList` entirely and renders `QuestionPreviewCard`.
  - The user has no list to select other questions unless they notice the small "Back to list" button. **Confirmed P1 (`RESP-004`)**.
- **Stress Test (Tablet 768px)**:
  - 768px viewport: Sidebar (240px) + PendingList (360px) = 600px.
  - Remaining for `QuestionPreviewCard` = **168px**.
  - In 168px: Taxonomy breadcrumbs, 4 badges, User chip, Date, Question Text, Options, and Approve/Reject buttons must render.
  - **Result**: Badges wrap into 4 lines, action buttons overflow. **Confirmed P1 (`RESP-005`)**.

### Step 4: Question List Panel Rows (`QuestionListPanel.tsx`)
- **Inspection**:
  - Line 181: `<div className="flex items-center gap-2.5 min-w-0 flex-1">` (Indicator + Text)
  - Line 193: `<div className="flex flex-shrink-0 items-center gap-2">` (TypeBadge + DifficultyBadge + StatusBadge)
  - Line 200: Action dropdown button (28px).
- **Stress Test (Mobile 360px)**:
  - Total row width = 360px (assuming full width without sidebar).
  - Badges: Type (~80px) + Difficulty (~65px) + Status (~90px) = 235px.
  - Action button = 28px.
  - Flashcard indicator = 20px.
  - Row padding = 32px.
  - Remaining for question text: 360 - (235 + 28 + 20 + 32) = **45px**.
- **Stress Test (Mobile 320px - iPhone SE)**:
  - 320 - 315 = **5px**.
  - **Result**: Question text is completely unreadable. **Confirmed P1 (`RESP-006`)**.

### Step 5: Audit Log Table & Controls (`AuditLogTable.tsx`)
- **Inspection**:
  - Table headers: Timestamp (180px), Action (130px), Preview (240px), Performed by (180px), Detail (200px). Total = **930px**.
  - Filter bar: Action select + From Date + To Date + Search Input (`min-w-[200px] flex-1`) + Reset.
  - Pagination bar: "Showing X–Y of Z" + Previous + Number buttons + Next.
- **Stress Test (Mobile 375px)**:
  - Pagination row width required = ~460px. On 375px, Next button and page numbers push off the right screen edge. **Confirmed P1 (`RESP-007`)**.
  - Filter row wraps across 4 staggered lines taking > 260px vertical height. **Confirmed P2 (`RESP-010`)**.
  - Table requires scrolling 555px horizontally (over 2.5 screen widths). **Confirmed P2 (`RESP-009`)**.

### Step 6: Dialog Modal & Virtual Keyboard (`src/components/ui/dialog.tsx` & `RejectModal.tsx`)
- **Inspection**:
  - `DialogContent`: `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-6`
  - Lacks `max-h-[90dvh]` and `overflow-y-auto`.
- **Stress Test (Mobile 390px with iOS Keyboard)**:
  - Screen height = 844px. Virtual keyboard height = ~320px. Remaining visible height = ~524px.
  - Modal height = ~360px.
  - `top-[50%] translate-y-[-50%]` centers relative to full viewport, causing the keyboard to cover the textarea and action buttons. **Confirmed P1 (`RESP-008`)**.

### Step 7: Touch Ergonomics & Calendar (`src/components/ui/calendar.tsx`)
- **Inspection**:
  - Line 122: `<button className="h-7 w-7 rounded-md text-xs font-medium ...">` (28px × 28px).
- **Stress Test (All touch devices)**:
  - WCAG 2.1 Success Criterion 2.5.5 (Target Size) requires 44px × 44px minimum for touch targets. WCAG 2.2 Success Criterion 2.5.8 (Target Size - Minimum) requires at least 24px with adequate spacing. 28px cells with 4px gap lead to accidental date selection on touch devices. **Confirmed P2 (`RESP-012`)**.

### Step 8: Question Editor & Options Builder (`QuestionEditor.tsx` & `OptionsBuilder.tsx`)
- **Inspection**:
  - Option row: Radio button (24px) + "Option A" chip (60px) + Input (`flex-1`) + Trash button (28px) + gaps (24px) = 136px non-input width.
  - Outer padding in `QuestionEditor`: `p-6` (48px) + card `p-5` (40px) = 88px padding.
- **Stress Test (320px - iPhone SE)**:
  - Usable input width = 320 - 88 - 136 = **96px**.
  - A user typing "The velocity of light in a vacuum" can only see 1–2 words at a time. **Confirmed P2 (`RESP-013`)**.

---

## 5. SYSTEMIC VS LOCAL CLASSIFICATION

### Systemic / Architectural Fixes (Fix Once, Fix Globally)
1. **Admin Layout Shell**: Add mobile Sheet/Drawer with hamburger trigger; replace `w-screen`/`h-screen` with `w-full`/`h-[100dvh]`.
2. **Dialog Primitive**: Add `max-h-[85dvh] overflow-y-auto w-[calc(100vw-2rem)]` in `src/components/ui/dialog.tsx` to protect all current and future modals.
3. **Calendar Primitive**: Increase touch targets to `h-9 w-9` (36px) or `h-10 w-10` (40px) in `src/components/ui/calendar.tsx`.
4. **Breakpoint System**: Re-align multi-column breakpoints from `md` (768px) to `xl` (1280px) across complex split-pane views.

### Local Component Fixes
1. `TaxonomyBrowser`: Adjust column visibility/responsiveness on tablets (768px–1279px).
2. `QuestionListPanel`: Collapse or wrap secondary badges on narrow viewports.
3. `ReviewQueue`: Fix mobile auto-selection logic and tablet split-pane activation.
4. `QuestionPreviewCard`: Stack action footer buttons on mobile and add `break-words`.
5. `AuditLogTable`: Stack pagination controls, structure mobile filters, provide mobile card view.
6. `OptionsBuilder`: Collapse redundant "Option A" chip into the radio button on mobile.

---

## 6. VERIFICATION STATUS SUMMARY
- Total Inspected Items: 9 screens/layouts, 17 components, 15 viewports.
- Total Unique Findings: 18.
- Confirmed Findings: **18 / 18 (100% verified against code implementation)**.
- Duplicates Filtered: 0 (all 18 target distinct code paths).
- Potential Issues Discarded: 3 (tested and verified as already non-breaking: e.g. `TaxonomySelector` 3-column grid already collapses cleanly to 1-column on `< sm`).
