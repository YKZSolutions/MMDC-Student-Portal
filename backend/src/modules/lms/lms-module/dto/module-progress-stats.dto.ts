import { ProgressStatus } from '@prisma/client';

export class ContentItemProgress {
  id: string;
  title: string;
  status: ProgressStatus;
  completedAt?: Date | null;
  lastAccessedAt?: Date | null;
  completedStudentsCount: number;
  totalStudentsCount: number;
  completionPercentage: number;
}

export class ContentSectionProgress {
  id: string;
  title: string;
  contentItems: ContentItemProgress[];
  completedContentItems: number;
  totalContentItems: number;
  progressPercentage: number;
  completedStudentsCount: number;
  totalStudentsCount: number;
  completionPercentage: number;
}

export class ModuleProgressOverview {
  moduleId: string;
  moduleTitle: string;
  completedContentItems: number;
  totalContentItems: number;
  notStartedContentItems: number;
  overdueAssignmentsCount: number;
  progressPercentage: number;
  status: ProgressStatus;
  lastAccessedAt?: Date | null;
  completedStudentsCount: number;
  totalStudentsCount: number;
  moduleCompletionPercentage: number;
}

export class ModuleProgressDetail {
  moduleId: string;
  moduleTitle: string;
  sections: ContentSectionProgress[];
  overallProgress: {
    completedContentItems: number;
    totalContentItems: number;
    progressPercentage: number;
    status: ProgressStatus;
    completedStudentsCount: number;
    totalStudentsCount: number;
    moduleCompletionPercentage: number;
  };
}

export class StudentProgressStats {
  studentId: string;
  studentName: string;
  completedModules: number;
  totalModules: number;
  averageProgress: number;
  lastActivity: Date | null;
}

export class DashboardProgress {
  studentProgress: ModuleProgressOverview[];
  overallStats?: {
    totalStudents: number;
    averageProgress: number;
    completedModules: number;
    inProgressModules: number;
    notStartedModules: number;
  };
  studentStats?: StudentProgressStats[];
}

export interface ProgressQueryParams {
  moduleId?: string;
  studentId?: string;
  courseOfferingId?: string;
}
