import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getSubjects, getSubtopics, getTopics } from '../api/taxonomy';
import type { Subject, Subtopic, Topic } from '../types/taxonomy';

/**
 * Configuration options for the cascading taxonomy hook.
 */
export interface UseTaxonomyOptions {
  subjectId?: string | null;
  topicId?: string | null;
}

/**
 * Result shape returned by useTaxonomy.
 */
export interface UseTaxonomyResult {
  subjects: UseQueryResult<Subject[], Error>;
  topics: UseQueryResult<Topic[], Error>;
  subtopics: UseQueryResult<Subtopic[], Error>;
}

/**
 * Hook for cascading Subject -> Topic -> Subtopic taxonomy queries.
 * Composes three separate internal queries:
 * 1. subjects: from useQuery(['subjects'])
 * 2. topics: from useQuery(['topics', subjectId], enabled: !!subjectId)
 * 3. subtopics: from useQuery(['subtopics', topicId], enabled: !!topicId)
 *
 * @param subjectIdOrOptions - Either an options object or the subjectId directly.
 * @param topicIdParam - The topicId if subjectId was passed as first argument.
 * @returns Composed object containing subjects, topics, and subtopics queries.
 *
 * @example
 * ```tsx
 * // Object parameter syntax
 * const { subjects, topics, subtopics } = useTaxonomy({ subjectId, topicId });
 *
 * // Positional parameter syntax
 * const { subjects, topics, subtopics } = useTaxonomy(subjectId, topicId);
 * ```
 */
export function useTaxonomy(
  subjectIdOrOptions?: string | null | UseTaxonomyOptions,
  topicIdParam?: string | null,
): UseTaxonomyResult {
  const subjectId =
    typeof subjectIdOrOptions === 'object' && subjectIdOrOptions !== null
      ? subjectIdOrOptions.subjectId
      : (subjectIdOrOptions as string | null | undefined);

  const topicId =
    typeof subjectIdOrOptions === 'object' && subjectIdOrOptions !== null
      ? subjectIdOrOptions.topicId
      : topicIdParam;

  const subjects = useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });

  const topics = useQuery<Topic[], Error>({
    queryKey: ['topics', subjectId],
    queryFn: () => getTopics(subjectId || undefined),
    enabled: Boolean(subjectId),
  });

  const subtopics = useQuery<Subtopic[], Error>({
    queryKey: ['subtopics', topicId],
    queryFn: () => getSubtopics(topicId || undefined),
    enabled: Boolean(topicId),
  });

  return {
    subjects,
    topics,
    subtopics,
  };
}

/**
 * Hook to fetch all active subjects.
 * Query key: ['subjects']
 */
export function useSubjects(): UseQueryResult<Subject[], Error> {
  return useQuery<Subject[], Error>({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });
}

/**
 * Hook to fetch topics for a specific subjectId.
 * Query key: ['topics', subjectId]
 */
export function useTopics(
  subjectId?: string | null,
): UseQueryResult<Topic[], Error> {
  return useQuery<Topic[], Error>({
    queryKey: ['topics', subjectId],
    queryFn: () => getTopics(subjectId || undefined),
    enabled: Boolean(subjectId),
  });
}

/**
 * Hook to fetch subtopics for a specific topicId.
 * Query key: ['subtopics', topicId]
 */
export function useSubtopics(
  topicId?: string | null,
): UseQueryResult<Subtopic[], Error> {
  return useQuery<Subtopic[], Error>({
    queryKey: ['subtopics', topicId],
    queryFn: () => getSubtopics(topicId || undefined),
    enabled: Boolean(topicId),
  });
}

export default useTaxonomy;
