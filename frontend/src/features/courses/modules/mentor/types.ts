import type { Module } from '@/features/courses/modules/types.ts'

export interface MentorModule extends Module {
  sectionStats: Array<{
    sectionId: string
    averageProgress: number
    completedStudents: number
    totalStudents: number
  }>
}
