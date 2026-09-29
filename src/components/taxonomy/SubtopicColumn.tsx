'use client';

import React from 'react';
import { Bookmark, ChevronRight, Loader2 } from 'lucide-react';
import type { Subtopic } from '../../types/taxonomy';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

export interface SubtopicColumnProps {
  subtopics: Subtopic[];
  isLoading: boolean;
  selectedTopicId: string | null;
  selectedSubtopicId: string | null;
  onSelectSubtopic: (subtopicId: string) => void;
}

export function SubtopicColumn({
  subtopics,
  isLoading,
  selectedTopicId,
  selectedSubtopicId,
  onSelectSubtopic,
}: SubtopicColumnProps): React.JSX.Element {
  return (
    <div className="flex h-full w-[195px] lg:w-[230px] flex-shrink-0 flex-col border-r-2 border-[#141827] bg-[#F8F5EF]">
      {/* Column Header */}
      <div className="flex h-11 items-center justify-between border-b-2 border-[#141827] px-3.5 bg-[#F0EBE0]">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#141827]">
          <Bookmark className="h-3.5 w-3.5 text-[#141827]" />
          <span>Subtopics</span>
        </div>
        {selectedTopicId && !isLoading && (
          <span className="rounded-full bg-white border border-[#141827] px-2 py-0.5 text-[10px] font-bold text-[#141827] shadow-sm">
            {subtopics.length}
          </span>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {!selectedTopicId ? (
          <div className="flex h-48 flex-col items-center justify-center p-4 text-center text-xs text-slate-500 font-medium">
            <p>Select a topic</p>
            <p className="mt-1 text-[11px] text-slate-400">to load its subtopics</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#141827]" />
          </div>
        ) : subtopics.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-medium">
            No subtopics found
          </div>
        ) : (
          <div className="divide-y divide-[#141827]/10 py-1">
            {subtopics.map((subtopic) => {
              const isSelected = subtopic.id === selectedSubtopicId;
              return (
                <button
                  key={subtopic.id}
                  onClick={() => onSelectSubtopic(subtopic.id)}
                  className={cn(
                    'group flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors',
                    isSelected
                      ? 'border-l-4 border-[#141827] bg-white font-bold text-[#141827] shadow-sm'
                      : 'border-l-4 border-transparent text-[#141827] hover:bg-white/60 hover:text-black',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate pr-1 leading-snug">
                    {subtopic.name}
                  </span>
                  <ChevronRight
                    className={cn(
                      'h-3.5 w-3.5 flex-shrink-0 transition-transform',
                      isSelected
                        ? 'text-[#141827] translate-x-0.5'
                        : 'text-slate-400 group-hover:text-[#141827]',
                    )}
                  />
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default SubtopicColumn;
