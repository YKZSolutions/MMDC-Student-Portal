import type { Module } from '@/features/courses/modules/types.ts'

export interface AdminModule extends Module {
  editingPermissions: {
    canPublish: boolean
    canSchedule: boolean
    canDelete: boolean
  }
}
