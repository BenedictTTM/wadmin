import apiClient from '../lib/axios';
import type { Subject, Subtopic, Topic } from '../types/taxonomy';

/**
 * Fetch all active subjects.
 * GET /subjects
 */
export async function getSubjects(): Promise<Subject[]> {
  const response = await apiClient.get<Subject[]>('/subjects');
  return response.data;
}

/**
 * Fetch topics for a subject.
 * GET /subjects/:subjectId/topics
 */
export async function getTopics(subjectId?: string): Promise<Topic[]> {
  if (!subjectId) return [];
  const response = await apiClient.get<Topic[]>(`/subjects/${subjectId}/topics`);
  return response.data;
}

/**
 * Fetch subtopics for a topic.
 * GET /topics/:topicId/subtopics
 */
export async function getSubtopics(topicId?: string): Promise<Subtopic[]> {
  if (!topicId) return [];
  const response = await apiClient.get<Subtopic[]>(`/topics/${topicId}/subtopics`);
  return response.data;
}
