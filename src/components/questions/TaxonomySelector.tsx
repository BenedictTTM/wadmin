'use client';

import React, { useEffect, useState } from 'react';
import { useTaxonomy } from '../../hooks/useTaxonomy';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

export interface TaxonomySelectorProps {
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  onSubjectChange?: (subjectId: string) => void;
  onTopicChange?: (topicId: string) => void;
  onSubtopicChange?: (subtopicId: string) => void;
  // Legacy / convenience props:
  value?: string; // subtopicId
  onChange?: (subtopicId: string) => void;
  initialSubjectId?: string;
  initialTopicId?: string;
  disabled?: boolean;
}

export function TaxonomySelector({
  subjectId: controlledSubjectId,
  topicId: controlledTopicId,
  subtopicId: controlledSubtopicId,
  onSubjectChange,
  onTopicChange,
  onSubtopicChange,
  value,
  onChange,
  initialSubjectId,
  initialTopicId,
  disabled = false,
}: TaxonomySelectorProps): React.JSX.Element {
  // Determine if component is externally controlled
  const isControlled =
    controlledSubjectId !== undefined ||
    controlledTopicId !== undefined ||
    controlledSubtopicId !== undefined;

  const [internalSubjectId, setInternalSubjectId] = useState<string>(
    initialSubjectId || '',
  );
  const [internalTopicId, setInternalTopicId] = useState<string>(
    initialTopicId || '',
  );

  const activeSubjectId = isControlled
    ? controlledSubjectId || ''
    : internalSubjectId;
  const activeTopicId = isControlled
    ? controlledTopicId || ''
    : internalTopicId;
  const activeSubtopicId = isControlled
    ? controlledSubtopicId || ''
    : value || '';

  const { subjects, topics, subtopics } = useTaxonomy({
    subjectId: activeSubjectId || undefined,
    topicId: activeTopicId || undefined,
  });

  // Sync initial values if provided later
  useEffect(() => {
    if (initialSubjectId && !internalSubjectId) {
      setInternalSubjectId(initialSubjectId);
    }
  }, [initialSubjectId, internalSubjectId]);

  useEffect(() => {
    if (initialTopicId && !internalTopicId) {
      setInternalTopicId(initialTopicId);
    }
  }, [initialTopicId, internalTopicId]);

  const handleSubjectChange = (newSubjectId: string) => {
    if (isControlled) {
      onSubjectChange?.(newSubjectId);
      onTopicChange?.('');
      onSubtopicChange?.('');
    } else {
      setInternalSubjectId(newSubjectId);
      setInternalTopicId('');
      onChange?.('');
    }
  };

  const handleTopicChange = (newTopicId: string) => {
    if (isControlled) {
      onTopicChange?.(newTopicId);
      onSubtopicChange?.('');
    } else {
      setInternalTopicId(newTopicId);
      onChange?.('');
    }
  };

  const handleSubtopicChange = (newSubtopicId: string) => {
    if (isControlled) {
      onSubtopicChange?.(newSubtopicId);
    } else {
      onChange?.(newSubtopicId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      {/* Subject Select */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">Subject</Label>
          {subjects.isLoading && (
            <span className="text-[10px] text-slate-400">Loading...</span>
          )}
        </div>
        <Select
          value={activeSubjectId}
          onValueChange={handleSubjectChange}
          disabled={disabled || subjects.isLoading}
        >
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue placeholder="Select subject…" />
          </SelectTrigger>
          <SelectContent>
            {subjects.data?.map((subject) => (
              <SelectItem key={subject.id} value={subject.id} className="text-xs">
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic Select */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">Topic</Label>
          {topics.isLoading && (
            <span className="text-[10px] text-slate-400">Loading...</span>
          )}
        </div>
        <Select
          value={activeTopicId}
          onValueChange={handleTopicChange}
          disabled={disabled || !activeSubjectId || topics.isLoading}
        >
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue
              placeholder={
                !activeSubjectId ? 'Select subject first' : 'Select topic…'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {topics.data?.map((topic) => (
              <SelectItem key={topic.id} value={topic.id} className="text-xs">
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subtopic Select */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">Subtopic</Label>
          {subtopics.isLoading && (
            <span className="text-[10px] text-slate-400">Loading...</span>
          )}
        </div>
        <Select
          value={activeSubtopicId}
          onValueChange={handleSubtopicChange}
          disabled={disabled || !activeTopicId || subtopics.isLoading}
        >
          <SelectTrigger className="h-9 text-xs bg-white">
            <SelectValue
              placeholder={
                !activeTopicId ? 'Select topic first' : 'Select subtopic…'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {subtopics.data?.map((subtopic) => (
              <SelectItem key={subtopic.id} value={subtopic.id} className="text-xs">
                {subtopic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default TaxonomySelector;
