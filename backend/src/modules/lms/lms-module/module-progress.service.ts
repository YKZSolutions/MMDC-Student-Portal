import { CustomPrismaService } from 'nestjs-prisma';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProgressStatus, Role } from '@prisma/client';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import {
  DashboardProgress,
  ModuleProgressDetail,
  ModuleProgressOverview,
  ProgressQueryParams,
  StudentProgressStats,
} from '@/modules/lms/lms-module/dto/module-progress-stats.dto';
import { ModuleSection } from '@/generated/nestjs-dto/moduleSection.entity';
import { LogParam } from '@/common/decorators/log-param.decorator';
import { Log } from '@/common/decorators/log.decorator';
import { ContentProgress } from '@/generated/nestjs-dto/contentProgress.entity';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import {
  MyModuleProgressItem,
  MyModulesProgressFilters,
  MyModulesProgressResponse,
  MyModulesProgressSummary,
} from '@/modules/lms/lms-module/dto/modules-progress.dto';

/**
 * Service for tracking and managing student progress across modules, sections, and content items in the LMS.
 *
 * This service provides methods to:
 * - Retrieve progress overviews and detailed breakdowns for modules, sections, and content items.
 * - Aggregate and compute statistics such as completion rates, overdue assignments, and last accessed times.
 * - Support different user roles (e.g., student, instructor) and query parameters for flexible progress tracking.
 *
 * Typical consumers include dashboard components, progress analytics, and reporting features within the LMS.
 */
@Injectable()
export class ModuleProgressService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ moduleId, userId, role }) =>
      `Getting module progress overview for module ${moduleId} by user ${userId} with role ${role}`,
    logSuccessMessage: (result, { moduleId }) =>
      `Retrieved module progress overview for module ${moduleId} (${result.progressPercentage}% complete)`,
    logErrorMessage: (err, { moduleId, userId }) =>
      `Failed to get module progress overview for module ${moduleId} by user ${userId} | Error: ${err.message}`,
  })
  async getModuleProgressOverview(
    @LogParam('moduleId') moduleId: string,
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    queryParams?: ProgressQueryParams,
  ): Promise<ModuleProgressOverview> {
    // Validate module exists
    const module = await this.prisma.client.module.findUnique({
      where: { id: moduleId },
      include: {
        moduleSections: {
          include: {
            moduleContents: {
              where: { publishedAt: { not: null } },
              orderBy: { order: 'asc' },
            },
          },
          where: { publishedAt: { not: null } },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    // Get student IDs based on a role
    const studentIds = await this.getStudentIdsForUser(
      userId,
      role,
      queryParams,
    );

    // Get progress data
    const progressData = await this.getModuleProgressData(moduleId, studentIds);

    return {
      moduleId: module.id,
      moduleTitle: module.title,
      completedContentItems: progressData.completedCount,
      totalContentItems: progressData.totalCount,
      notStartedContentItems: progressData.notStartedCount,
      overdueAssignmentsCount: progressData.overdueAssignmentsCount,
      progressPercentage:
        progressData.totalCount > 0
          ? Math.round(
              (progressData.completedCount / progressData.totalCount) * 100,
            )
          : 0,
      status: this.getOverallStatus(
        progressData.completedCount,
        progressData.totalCount,
      ),
      lastAccessedAt: progressData.lastAccessedAt,
      completedStudentsCount: progressData.completedStudentsCount,
      totalStudentsCount: studentIds.length,
      moduleCompletionPercentage:
        studentIds.length > 0
          ? Math.round(
              (progressData.completedStudentsCount / studentIds.length) * 100,
            )
          : 0,
    };
  }

  /**
   * 2. Progress of module broke down into module > sections > content items
   */
  @Log({
    logArgsMessage: ({ moduleId, userId, role }) =>
      `Getting detailed module progress for module ${moduleId} by user ${userId} with role ${role}`,
    logSuccessMessage: (result, { moduleId }) =>
      `Retrieved detailed module progress for module ${moduleId} (${result.overallProgress.progressPercentage}% complete, ${result.sections.length} sections)`,
    logErrorMessage: (err, { moduleId, userId }) =>
      `Failed to get detailed module progress for module ${moduleId} by user ${userId} | Error: ${err.message}`,
  })
  async getModuleProgressDetail(
    @LogParam('moduleId') moduleId: string,
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    queryParams?: ProgressQueryParams,
  ): Promise<ModuleProgressDetail> {
    // Validate module exists and get structure
    const module = await this.prisma.client.module.findUnique({
      where: { id: moduleId },
      include: {
        moduleSections: {
          include: {
            moduleContents: {
              where: { publishedAt: { not: null } },
              orderBy: { order: 'asc' },
            },
          },
          where: { publishedAt: { not: null } },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    // Get student IDs based on a role
    const studentIds = await this.getStudentIdsForUser(
      userId,
      role,
      queryParams,
    );
    const totalStudentsCount = studentIds.length;

    // Get detailed progress for each section and content item
    const sectionsProgress = await Promise.all(
      module.moduleSections.map((section) =>
        this.getSectionProgress(
          section as ModuleSection,
          studentIds,
          totalStudentsCount,
        ),
      ),
    );

    // Calculate module-level completion
    const moduleCompletionData = await this.getModuleCompletionData(
      moduleId,
      studentIds,
    );

    const totalCompleted = sectionsProgress.reduce(
      (sum, section) => sum + section.completedContentItems,
      0,
    );
    const totalContentItems = sectionsProgress.reduce(
      (sum, section) => sum + section.totalContentItems,
      0,
    );

    return {
      moduleId: module.id,
      moduleTitle: module.title,
      sections: sectionsProgress,
      overallProgress: {
        completedContentItems: totalCompleted,
        totalContentItems: totalContentItems,
        progressPercentage:
          totalContentItems > 0
            ? Math.round((totalCompleted / totalContentItems) * 100)
            : 0,
        status: this.getOverallStatus(totalCompleted, totalContentItems),
        completedStudentsCount: moduleCompletionData.completedStudentsCount,
        totalStudentsCount: totalStudentsCount,
        moduleCompletionPercentage:
          totalStudentsCount > 0
            ? Math.round(
                (moduleCompletionData.completedStudentsCount /
                  totalStudentsCount) *
                  100,
              )
            : 0,
      },
    };
  }

  private async getModuleCompletionData(
    moduleId: string,
    studentIds: string[],
  ) {
    // Get all content items in the module
    const contentItems = await this.prisma.client.moduleContent.findMany({
      where: {
        moduleSection: {
          moduleId,
          publishedAt: { not: null },
        },
        publishedAt: { not: null },
      },
      select: {
        id: true,
      },
    });

    const contentItemIds = contentItems.map((item) => item.id);

    if (contentItemIds.length === 0) {
      return { completedStudentsCount: 0 };
    }

    // Count students who have completed ALL content items in the module
    const grouped = await this.prisma.client.contentProgress.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        moduleContentId: { in: contentItemIds },
        status: ProgressStatus.COMPLETED,
      },
      _count: {
        moduleContentId: true,
      },
    });

    const completionCount = grouped.filter(
      (g) => g._count.moduleContentId === contentItemIds.length,
    );

    return { completedStudentsCount: completionCount.length };
  }

  private async getSectionCompletionData(
    sectionId: string,
    studentIds: string[],
  ) {
    // Get all content items in the section
    const contentItems = await this.prisma.client.moduleContent.findMany({
      where: {
        moduleSectionId: sectionId,
        publishedAt: { not: null },
      },
      select: {
        id: true,
      },
    });

    const contentItemIds = contentItems.map((item) => item.id);

    if (contentItemIds.length === 0) {
      return { completedStudentsCount: 0 };
    }

    // Count students who have completed ALL content items in the section
    const grouped = await this.prisma.client.contentProgress.groupBy({
      by: ['studentId'],
      where: {
        studentId: { in: studentIds },
        moduleContentId: { in: contentItemIds },
        status: ProgressStatus.COMPLETED,
      },
      _count: {
        moduleContentId: true,
      },
    });

    const completionCount = grouped.filter(
      (g) => g._count.moduleContentId === contentItemIds.length,
    );

    return { completedStudentsCount: completionCount.length };
  }

  private async getContentItemCompletionData(
    contentItemId: string,
    studentIds: string[],
  ) {
    // Count students who have completed this specific content item
    const completedCount = await this.prisma.client.contentProgress.count({
      where: {
        moduleContentId: contentItemId,
        studentId: { in: studentIds },
        status: ProgressStatus.COMPLETED,
      },
    });

    return { completedStudentsCount: completedCount };
  }

  /**
   * 3. Progress of modules for a dashboard
   */
  @Log({
    logArgsMessage: ({ userId, role }) =>
      `Getting dashboard progress for user ${userId} with role ${role}`,
    logSuccessMessage: (result, { userId, role }) =>
      `Retrieved dashboard progress for user ${userId} with role ${role} (${result.studentProgress?.length || 0} modules)`,
    logErrorMessage: (err, { userId, role }) =>
      `Failed to get dashboard progress for user ${userId} with role ${role} | Error: ${err.message}`,
  })
  async getDashboardProgress(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    queryParams?: ProgressQueryParams,
  ): Promise<DashboardProgress> {
    // Get student IDs based on the role
    const studentIds = await this.getStudentIdsForUser(
      userId,
      role,
      queryParams,
    );

    // Get modules for the relevant course offerings
    const modules = await this.getRelevantModules(userId, role, queryParams);

    // Get progress for each module
    const studentProgress = await Promise.all(
      modules.map((module) =>
        this.getModuleProgressOverview(module.id, userId, role, {
          ...queryParams,
        }),
      ),
    );

    const result: DashboardProgress = {
      studentProgress,
    };

    // Add extra stats for mentors and admins
    if (role !== Role.student) {
      result.overallStats = await this.getOverallProgressStats(
        studentIds,
        modules,
      );
      result.studentStats = await this.getStudentProgressStats(
        studentIds,
        modules,
      );
    }

    return result;
  }

  /**
   * Get progress overview for all modules the current user is enrolled in or responsible for
   */
  @Log({
    logArgsMessage: ({ userId, role, filters }) =>
      `Getting my modules progress for user ${userId} with role ${role}, filters: ${JSON.stringify(filters)}`,
    logSuccessMessage: (result: MyModulesProgressResponse, { userId, role }) =>
      `Retrieved my modules progress for user ${userId} with role ${role}: ${result.modules.length} modules, overall progress ${result.summary.overallProgress}%`,
    logErrorMessage: (err, { userId, role, filters }) =>
      `Failed to get my modules progress for user ${userId} with role ${role}, filters: ${JSON.stringify(filters)} | Error: ${err.message}`,
  })
  async getMyModulesProgress(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    @LogParam('filters') filters?: MyModulesProgressFilters,
  ): Promise<MyModulesProgressResponse> {
    // Get dashboard progress first
    const dashboard = await this.getDashboardProgress(
      userId,
      role,
      filters?.courseOfferingId
        ? { courseOfferingId: filters.courseOfferingId }
        : undefined,
    );

    let modules = dashboard.studentProgress || [];

    // Apply status filter if provided
    if (filters?.status) {
      modules = modules.filter((module) => module.status === filters.status);
    }

    // Apply search filter if provided
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      modules = modules.filter((module) =>
        module.moduleTitle.toLowerCase().includes(searchLower),
      );
    }

    // Enhance modules with additional course information
    const enhancedModules = await this.enhanceModulesWithCourseInfo(
      modules,
      userId,
      role,
    );

    // Calculate a comprehensive summary
    const summary = this.calculateMyModulesSummary(enhancedModules);

    return {
      modules: enhancedModules,
      summary,
    };
  }

  /**
   * Enhance modules with course information
   */
  private async enhanceModulesWithCourseInfo(
    modules: ModuleProgressOverview[],
    userId: string,
    role: Role,
  ): Promise<MyModuleProgressItem[]> {
    if (modules.length === 0) {
      return [];
    }

    // Get course information for all modules
    const moduleIds = modules.map((module) => module.moduleId);

    const modulesWithCourses = await this.prisma.client.module.findMany({
      where: {
        id: { in: moduleIds },
      },
      include: {
        courseOffering: {
          include: {
            course: true,
          },
        },
      },
    });

    // Create a map for a quick lookup
    const moduleCourseMap = new Map(
      modulesWithCourses.map((mc) => [
        mc.id,
        {
          courseName: mc.courseOffering?.course?.name,
          courseCode: mc.courseOffering?.course?.courseCode,
          courseOfferingId: mc.courseOfferingId,
        },
      ]),
    );

    return modules.map((module) => {
      const courseInfo = moduleCourseMap.get(module.moduleId);

      return {
        moduleId: module.moduleId,
        moduleTitle: module.moduleTitle,
        courseName: courseInfo?.courseName,
        courseCode: courseInfo?.courseCode,
        courseOfferingId: courseInfo?.courseOfferingId,
        progressPercentage: module.progressPercentage,
        status: module.status,
        completedContentItems: module.completedContentItems,
        totalContentItems: module.totalContentItems,
        overdueAssignmentsCount: module.overdueAssignmentsCount,
        lastAccessedAt: module.lastAccessedAt,
      };
    });
  }

  /**
   * Calculate a comprehensive summary for my modules progress
   */
  private calculateMyModulesSummary(
    modules: MyModuleProgressItem[],
  ): MyModulesProgressSummary {
    if (modules.length === 0) {
      return {
        totalModules: 0,
        completedModules: 0,
        inProgressModules: 0,
        notStartedModules: 0,
        overallProgress: 0,
        totalOverdueAssignments: 0,
        totalCompletedContent: 0,
        totalContentItems: 0,
      };
    }

    const completedModules = modules.filter(
      (m) => m.status === ProgressStatus.COMPLETED,
    ).length;
    const inProgressModules = modules.filter(
      (m) => m.status === ProgressStatus.IN_PROGRESS,
    ).length;
    const notStartedModules = modules.filter(
      (m) => m.status === ProgressStatus.NOT_STARTED,
    ).length;

    const totalOverdueAssignments = modules.reduce(
      (sum, m) => sum + m.overdueAssignmentsCount,
      0,
    );
    const totalCompletedContent = modules.reduce(
      (sum, m) => sum + m.completedContentItems,
      0,
    );
    const totalContentItems = modules.reduce(
      (sum, m) => sum + m.totalContentItems,
      0,
    );

    const overallProgress =
      modules.length > 0
        ? Math.round(
            modules.reduce((sum, m) => sum + m.progressPercentage, 0) /
              modules.length,
          )
        : 0;

    return {
      totalModules: modules.length,
      completedModules,
      inProgressModules,
      notStartedModules,
      overallProgress,
      totalOverdueAssignments,
      totalCompletedContent,
      totalContentItems,
    };
  }

  // Private helper methods

  private async getStudentIdsForUser(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    queryParams?: ProgressQueryParams,
  ): Promise<string[]> {
    switch (role) {
      case Role.student:
        return [userId];

      case Role.mentor:
        return this.getMentorStudentIds(userId, queryParams);

      case Role.admin:
        return this.getAllStudentIds(queryParams);

      default:
        return [];
    }
  }

  private async getMentorStudentIds(
    @LogParam('mentorId') mentorId: string,
    queryParams?: ProgressQueryParams,
  ): Promise<string[]> {
    const sections = await this.prisma.client.courseSection.findMany({
      where: {
        mentorId,
        ...(queryParams?.courseOfferingId && {
          courseOfferingId: queryParams.courseOfferingId,
        }),
      },
      include: {
        courseEnrollments: {
          where: {
            status: { in: ['enrolled', 'completed'] },
          },
          include: {
            student: true,
          },
        },
      },
    });

    return sections.flatMap((section) =>
      section.courseEnrollments.map((enrollment) => enrollment.studentId),
    );
  }

  private async getAllStudentIds(
    queryParams?: ProgressQueryParams,
  ): Promise<string[]> {
    const enrollments = await this.prisma.client.courseEnrollment.findMany({
      where: {
        status: { in: ['enrolled', 'completed'] },
        ...(queryParams?.courseOfferingId && {
          courseOfferingId: queryParams.courseOfferingId,
        }),
      },
      select: {
        studentId: true,
      },
    });

    return [...new Set(enrollments.map((enrollment) => enrollment.studentId))];
  }

  private async getModuleProgressData(
    moduleId: string,
    studentIds: string[],
  ): Promise<{
    completedCount: number;
    totalCount: number;
    notStartedCount: number;
    overdueAssignmentsCount: number;
    lastAccessedAt?: Date | null;
    completedStudentsCount: number;
  }> {
    // Get all content items in the module
    const contentItems = await this.prisma.client.moduleContent.findMany({
      where: {
        moduleSection: {
          moduleId,
          publishedAt: { not: null },
        },
        publishedAt: { not: null },
      },
      include: {
        assignment: {
          select: {
            dueDate: true,
            gracePeriodMinutes: true,
            allowLateSubmission: true,
          },
        },
      },
    });

    const contentItemIds = contentItems.map((item) => item.id);
    const totalCount = contentItemIds.length;

    if (totalCount === 0) {
      return {
        completedCount: 0,
        totalCount: 0,
        notStartedCount: 0,
        overdueAssignmentsCount: 0,
        completedStudentsCount: 0,
      };
    }

    // Get progress for these content items across all students
    const progressRecords = await this.prisma.client.contentProgress.findMany({
      where: {
        moduleContentId: { in: contentItemIds },
        studentId: { in: studentIds },
      },
      orderBy: {
        lastAccessedAt: 'desc',
      },
    });

    const completedCount = progressRecords.filter(
      (record) => record.status === ProgressStatus.COMPLETED,
    ).length;

    const lastAccessedAt = progressRecords[0]?.lastAccessedAt;

    // Calculate haven't started count
    const notStartedCount = this.calculateNotStartedCount(
      contentItemIds,
      studentIds,
      progressRecords,
    );

    // Calculate overdue assignments count
    const overdueAssignmentsCount = this.calculateOverdueAssignmentsCount(
      contentItems as ModuleContent[],
      studentIds,
      progressRecords,
    );

    // Calculate module completion count (students who completed all content items)
    const moduleCompletionData = await this.getModuleCompletionData(
      moduleId,
      studentIds,
    );

    return {
      completedCount,
      totalCount,
      notStartedCount,
      overdueAssignmentsCount,
      lastAccessedAt,
      completedStudentsCount: moduleCompletionData.completedStudentsCount,
    };
  }

  private calculateNotStartedCount(
    contentItemIds: string[],
    studentIds: string[],
    progressRecords: ContentProgress[],
  ): number {
    // Total possible student-content combinations
    const totalPossibleCombinations = contentItemIds.length * studentIds.length;

    if (totalPossibleCombinations === 0) return 0;

    // Count how many student-content combinations have progress records
    const combinationsWithProgress = new Set(
      progressRecords.map(
        (record) => `${record.studentId}-${record.moduleContentId}`,
      ),
    ).size;

    // Not started = total possible - those with any progress
    return totalPossibleCombinations - combinationsWithProgress;
  }

  private calculateOverdueAssignmentsCount(
    contentItems: ModuleContent[],
    studentIds: string[],
    progressRecords: ContentProgress[],
  ): number {
    const now = new Date();
    let overdueCount = 0;

    // Filter only assignment content items
    const assignmentContentItems = contentItems.filter(
      (item) => item.assignment && item.contentType === 'ASSIGNMENT',
    );

    for (const contentItem of assignmentContentItems) {
      const assignment = contentItem.assignment;

      if (!assignment?.dueDate) continue;

      // Calculate effective due date considering grace period
      const dueDate = new Date(assignment.dueDate);
      const gracePeriodMs = (assignment.gracePeriodMinutes || 0) * 60 * 1000;
      const effectiveDueDate = new Date(dueDate.getTime() + gracePeriodMs);

      // Skip if the due date is in the future
      if (now <= effectiveDueDate) continue;

      // Check each student's progress for this assignment
      for (const studentId of studentIds) {
        const studentProgress = progressRecords.find(
          (record) =>
            record.studentId === studentId &&
            record.moduleContentId === contentItem.id,
        );

        // Assignment is overdue if:
        // 1. No progress record exists (not started) OR
        // 2. Progress exists but is not completed AND the due date has passed
        const isOverdue =
          !studentProgress ||
          studentProgress.status !== ProgressStatus.COMPLETED;

        if (isOverdue) {
          overdueCount++;
        }
      }
    }

    return overdueCount;
  }

  private async getSectionProgress(
    section: ModuleSection,
    studentIds: string[],
    totalStudentsCount: number,
  ) {
    const contentItemIds = (section.moduleContents || []).map(
      (content) => content.id,
    );
    const totalContentItems = contentItemIds.length;

    if (totalContentItems === 0) {
      return {
        id: section.id,
        title: section.title,
        order: section.order,
        contentItems: [],
        completedContentItems: 0,
        totalContentItems: 0,
        progressPercentage: 0,
        completedStudentsCount: 0,
        totalStudentsCount: totalStudentsCount,
        completionPercentage: 0,
      };
    }

    // Get progress for content items in this section
    const progressRecords = await this.prisma.client.contentProgress.findMany({
      where: {
        moduleContentId: { in: contentItemIds },
        studentId: { in: studentIds },
      },
      include: {
        moduleContent: true,
      },
    });

    const contentItemsProgress = await Promise.all(
      (section.moduleContents || []).map(async (content) => {
        const contentCompletionData = await this.getContentItemCompletionData(
          content.id,
          studentIds,
        );

        const studentProgress = progressRecords.find(
          (record) => record.moduleContentId === content.id,
        );

        return {
          id: content.id,
          title: content.title,
          subtitle: content.subtitle,
          contentType: content.contentType,
          order: content.order,
          status: studentProgress?.status || ProgressStatus.NOT_STARTED,
          completedAt: studentProgress?.completedAt,
          lastAccessedAt: studentProgress?.lastAccessedAt,
          completedStudentsCount: contentCompletionData.completedStudentsCount,
          totalStudentsCount: totalStudentsCount,
          completionPercentage:
            totalStudentsCount > 0
              ? Math.round(
                  (contentCompletionData.completedStudentsCount /
                    totalStudentsCount) *
                    100,
                )
              : 0,
        };
      }),
    );

    const completedContentItems = contentItemsProgress.filter(
      (item) => item.status === ProgressStatus.COMPLETED,
    ).length;

    // Get section-level completion data (students who completed ALL content items in this section)
    const sectionCompletionData = await this.getSectionCompletionData(
      section.id,
      studentIds,
    );

    return {
      id: section.id,
      title: section.title,
      order: section.order,
      contentItems: contentItemsProgress,
      completedContentItems,
      totalContentItems,
      progressPercentage:
        totalContentItems > 0
          ? Math.round((completedContentItems / totalContentItems) * 100)
          : 0,
      completedStudentsCount: sectionCompletionData.completedStudentsCount,
      totalStudentsCount: totalStudentsCount,
      completionPercentage:
        totalStudentsCount > 0
          ? Math.round(
              (sectionCompletionData.completedStudentsCount /
                totalStudentsCount) *
                100,
            )
          : 0,
    };
  }

  private async getRelevantModules(
    @LogParam('userId') userId: string,
    @LogParam('role') role: Role,
    queryParams?: ProgressQueryParams,
  ): Promise<
    Array<{
      id: string;
      title: string;
      courseId?: string | null;
      courseOfferingId?: string | null;
    }>
  > {
    if (role === Role.student) {
      // Get modules from student's enrolled courses
      const enrollments = await this.prisma.client.courseEnrollment.findMany({
        where: {
          studentId: userId,
          status: { in: ['enrolled', 'completed'] },
        },
        include: {
          courseOffering: {
            include: {
              modules: {
                where: { publishedAt: { not: null } },
              },
            },
          },
        },
      });

      return enrollments.flatMap(
        (enrollment) => enrollment.courseOffering.modules,
      );
    }

    // For mentors and admins, get all modules or filtered by the course offering
    const whereClause: Prisma.ModuleWhereInput = { publishedAt: { not: null } };

    if (queryParams?.courseOfferingId) {
      whereClause.courseOfferingId = queryParams.courseOfferingId;
    }

    return await this.prisma.client.module.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    });
  }

  private async getOverallProgressStats(
    @LogParam('studentIds') studentIds: string[],
    @LogParam('modules')
    modules: Array<{
      id: string;
      title: string;
      courseId?: string | null;
      courseOfferingId?: string | null;
    }>,
  ) {
    const moduleIds = modules.map((module) => module.id);

    // Get all progress records for these students and modules
    const progressRecords = await this.prisma.client.contentProgress.findMany({
      where: {
        studentId: { in: studentIds },
        moduleId: { in: moduleIds },
      },
    });

    // Calculate module completion
    const moduleProgress = await Promise.all(
      modules.map(async (module) => {
        const moduleContentCount = await this.prisma.client.moduleContent.count(
          {
            where: {
              moduleSection: {
                moduleId: module.id,
                publishedAt: { not: null },
              },
              publishedAt: { not: null },
            },
          },
        );

        const moduleCompletedCount = progressRecords.filter(
          (record) =>
            record.moduleId === module.id &&
            record.status === ProgressStatus.COMPLETED,
        ).length;

        return {
          moduleId: module.id,
          progressPercentage:
            moduleContentCount > 0
              ? (moduleCompletedCount / moduleContentCount) * 100
              : 0,
        };
      }),
    );

    const completedModules = moduleProgress.filter(
      (module) => module.progressPercentage === 100,
    ).length;

    const inProgressModules = moduleProgress.filter(
      (module) =>
        module.progressPercentage > 0 && module.progressPercentage < 100,
    ).length;

    const notStartedModules = moduleProgress.filter(
      (module) => module.progressPercentage === 0,
    ).length;

    const totalProgress = moduleProgress.reduce(
      (sum, module) => sum + module.progressPercentage,
      0,
    );
    const averageProgress =
      modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;

    return {
      totalStudents: studentIds.length,
      averageProgress,
      completedModules,
      inProgressModules,
      notStartedModules,
    };
  }

  private async getStudentProgressStats(
    @LogParam('studentIds') studentIds: string[],
    @LogParam('modules')
    modules: Array<{
      id: string;
      title: string;
      courseId?: string | null;
      courseOfferingId?: string | null;
    }>,
  ): Promise<StudentProgressStats[]> {
    const moduleIds = modules.map((module) => module.id);

    const results = await Promise.all(
      studentIds.map(async (studentId) => {
        const student = await this.prisma.client.user.findUnique({
          where: { id: studentId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        });

        if (!student) {
          return null;
        }

        // Get student's progress across all modules
        const progressRecords =
          await this.prisma.client.contentProgress.findMany({
            where: {
              studentId,
              moduleId: { in: moduleIds },
            },
            orderBy: {
              lastAccessedAt: 'desc',
            },
          });

        // Calculate module completion for this student
        const moduleProgress = await Promise.all(
          modules.map(async (module) => {
            const moduleContentCount =
              await this.prisma.client.moduleContent.count({
                where: {
                  moduleSection: {
                    moduleId: module.id,
                    publishedAt: { not: null },
                  },
                  publishedAt: { not: null },
                },
              });

            const moduleCompletedCount = progressRecords.filter(
              (record) =>
                record.moduleId === module.id &&
                record.status === ProgressStatus.COMPLETED,
            ).length;

            return {
              moduleId: module.id,
              isCompleted:
                moduleContentCount > 0 &&
                moduleCompletedCount === moduleContentCount,
              progressPercentage:
                moduleContentCount > 0
                  ? (moduleCompletedCount / moduleContentCount) * 100
                  : 0,
            };
          }),
        );

        const completedModules = moduleProgress.filter(
          (module) => module.isCompleted,
        ).length;

        const totalProgress = moduleProgress.reduce(
          (sum, module) => sum + module.progressPercentage,
          0,
        );
        const averageProgress =
          modules.length > 0 ? Math.round(totalProgress / modules.length) : 0;

        const lastActivity = progressRecords[0]?.lastAccessedAt ?? null;

        return {
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          completedModules,
          totalModules: modules.length,
          averageProgress,
          lastActivity,
        };
      }),
    ).then((stats) => stats.filter(Boolean));

    return results.filter(
      (result): result is StudentProgressStats =>
        result !== null && 'studentId' in result && 'studentName' in result,
    );
  }

  private getOverallStatus(completed: number, total: number): ProgressStatus {
    if (completed === 0) return ProgressStatus.NOT_STARTED;
    if (completed === total) return ProgressStatus.COMPLETED;
    return ProgressStatus.IN_PROGRESS;
  }
}
