'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import { SubjectColumn } from './SubjectColumn';
import { TopicColumn } from './TopicColumn';
import { SubtopicColumn } from './SubtopicColumn';
import { QuestionListPanel, type UserRole } from './QuestionListPanel';
import { cn } from '../../lib/utils';

export interface TaxonomyBrowserProps {
  role?: UserRole;
  searchQuery?: string;
}

export function TaxonomyBrowser({
  role = 'ADMIN',
  searchQuery,
}: TaxonomyBrowserProps): React.JSX.Element {
  // Navigation state held in component (NOT in URL for MVP)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);

  // Mobile active panel: 'subjects' | 'topics' | 'subtopics' | 'questions'
  const [mobileActivePanel, setMobileActivePanel] = useState<
    'subjects' | 'topics' | 'subtopics' | 'questions'
  >('subjects');

  // Composed taxonomy hook
  const { subjects, topics, subtopics } = useTaxonomy({
    subjectId: selectedSubjectId,
    topicId: selectedTopicId,
  });



  // Handlers maintaining cascade clearing rules
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setSelectedTopicId(null);
    setSelectedSubtopicId(null);
    setMobileActivePanel('topics');
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    setSelectedSubtopicId(null);
    setMobileActivePanel('subtopics');
  };

  const handleSelectSubtopic = (subtopicId: string) => {
    setSelectedSubtopicId(subtopicId);
    setMobileActivePanel('questions');
  };

  // Find names for breadcrumbs and header labels
  const selectedSubject = useMemo(
    () => subjects.data?.find((s) => s.id === selectedSubjectId),
    [subjects.data, selectedSubjectId],
  );

  const selectedTopic = useMemo(
    () => topics.data?.find((t) => t.id === selectedTopicId),
    [topics.data, selectedTopicId],
  );

  const selectedSubtopic = useMemo(
    () => subtopics.data?.find((st) => st.id === selectedSubtopicId),
    [subtopics.data, selectedSubtopicId],
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white border-2 border-[#141827] rounded-xl shadow-tactile">
      {/* Mobile Breadcrumb Navigation (< md) */}
      <div className="flex md:hidden items-center gap-1.5 border-b-2 border-[#141827] bg-[#F8F5EF] px-3 py-2 text-xs text-[#141827] overflow-x-auto">
        <button
          onClick={() => setMobileActivePanel('subjects')}
          className={cn(
            'flex items-center gap-1 font-bold transition-colors',
            mobileActivePanel === 'subjects' ? 'text-[#141827] underline decoration-[#F6D86B] decoration-2' : 'text-slate-600 hover:text-[#141827]',
          )}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Subjects</span>
        </button>

        {selectedSubject && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => setMobileActivePanel('topics')}
              className={cn(
                'truncate font-medium transition-colors max-w-[100px]',
                mobileActivePanel === 'topics' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {selectedSubject.name}
            </button>
          </>
        )}

        {selectedTopic && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => setMobileActivePanel('subtopics')}
              className={cn(
                'truncate font-medium transition-colors max-w-[100px]',
                mobileActivePanel === 'subtopics' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {selectedTopic.name}
            </button>
          </>
        )}

        {selectedSubtopic && (
          <>
            <ChevronRight className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => setMobileActivePanel('questions')}
              className={cn(
                'truncate font-medium transition-colors max-w-[100px]',
                mobileActivePanel === 'questions' ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800',
              )}
            >
              {selectedSubtopic.name}
            </button>
          </>
        )}
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop View: 3-column drill-down + questions */}
        <div className="hidden md:flex h-full w-full overflow-x-auto overflow-y-hidden">
          {/* Column 1: Subjects (200px) */}
          <SubjectColumn
            subjects={subjects.data ?? []}
            isLoading={subjects.isLoading}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={handleSelectSubject}
          />

          {/* Column 2: Topics (220px) */}
          <TopicColumn
            topics={topics.data ?? []}
            isLoading={topics.isLoading}
            selectedSubjectId={selectedSubjectId}
            selectedTopicId={selectedTopicId}
            onSelectTopic={handleSelectTopic}
          />

          {/* Column 3: Subtopics (240px) */}
          <SubtopicColumn
            subtopics={subtopics.data ?? []}
            isLoading={subtopics.isLoading}
            selectedTopicId={selectedTopicId}
            selectedSubtopicId={selectedSubtopicId}
            onSelectSubtopic={handleSelectSubtopic}
          />

          {/* Column 4: Questions (Fills Rest) */}
          <QuestionListPanel
            selectedSubtopicId={selectedSubtopicId}
            selectedSubjectId={selectedSubjectId}
            selectedTopicId={selectedTopicId}
            subtopicName={selectedSubtopic?.name}
            role={role}
            searchQuery={searchQuery}
          />
        </div>

        {/* Mobile View: One Panel At a Time (< md) */}
        <div className="flex md:hidden h-full w-full overflow-hidden">
          {mobileActivePanel === 'subjects' && (
            <div className="h-full w-full">
              <SubjectColumn
                subjects={subjects.data ?? []}
                isLoading={subjects.isLoading}
                selectedSubjectId={selectedSubjectId}
                onSelectSubject={handleSelectSubject}
              />
            </div>
          )}

          {mobileActivePanel === 'topics' && (
            <div className="h-full w-full">
              <TopicColumn
                topics={topics.data ?? []}
                isLoading={topics.isLoading}
                selectedSubjectId={selectedSubjectId}
                selectedTopicId={selectedTopicId}
                onSelectTopic={handleSelectTopic}
              />
            </div>
          )}

          {mobileActivePanel === 'subtopics' && (
            <div className="h-full w-full">
              <SubtopicColumn
                subtopics={subtopics.data ?? []}
                isLoading={subtopics.isLoading}
                selectedTopicId={selectedTopicId}
                selectedSubtopicId={selectedSubtopicId}
                onSelectSubtopic={handleSelectSubtopic}
              />
            </div>
          )}

          {mobileActivePanel === 'questions' && (
            <div className="h-full w-full">
              <QuestionListPanel
                selectedSubtopicId={selectedSubtopicId}
                selectedSubjectId={selectedSubjectId}
                selectedTopicId={selectedTopicId}
                subtopicName={selectedSubtopic?.name}
                role={role}
                searchQuery={searchQuery}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaxonomyBrowser;
