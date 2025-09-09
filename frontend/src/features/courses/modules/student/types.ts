import type { Module } from '@/features/courses/modules/types.ts'

export interface StudentModule extends Module {
  studentProgress: {
    overallProgress: number
    completedItems: number
    totalItems: number
    overdueItems: number
  }
}
