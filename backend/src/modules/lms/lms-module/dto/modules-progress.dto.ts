import { ProgressStatus } from '@prisma/client';

export class MyModuleProgressItem {
  moduleId: string;
  moduleTitle: string;
  courseName?: string;
  courseCode?: string;
  progressPercentage: number;
  status: ProgressStatus;
  completedContentItems: number;
  totalContentItems: number;
  overdueAssignmentsCount: number;
  lastAccessedAt?: Date | null;
  courseOfferingId?: string | null;
}

export class MyModulesProgressSummary {
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  overallProgress: number;
  totalOverdueAssignments: number;
  totalCompletedContent: number;
  totalContentItems: number;
}

export class MyModulesProgressResponse {
  modules: MyModuleProgressItem[];
  summary: MyModulesProgressSummary;
}

export class MyModulesProgressFilters {
  status?: ProgressStatus;
  search?: string;
  courseOfferingId?: string;
}
