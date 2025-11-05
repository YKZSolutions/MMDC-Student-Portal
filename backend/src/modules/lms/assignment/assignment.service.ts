import {
  ExtendedPrismaClient,
  PrismaTransaction,
} from '@/lib/prisma/prisma.extension';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma';
import {
  PaginatedAssignmentDto,
  PaginatedMentorAssignmentDto,
  PaginatedStudentAssignmentDto,
  StudentAssignmentItemDto,
} from './dto/paginated-assignment.dto';
import { PaginatedAllTasksDto } from './dto/all-tasks.dto';
import {
  FilterAllTasksDto,
  TaskStatusFilter,
  TaskSortBy,
} from './dto/filter-all-tasks.dto';
import { AssignmentSubmission, Prisma } from '@prisma/client';
import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { SubmitAssignmentDto } from '../submission/dto/submit-assignment.dto';
import { MessageDto } from '@/common/dto/message.dto';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { UpdateAssignmentConfigDto } from '@/modules/lms/assignment/dto/update-assignment-config.dto';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  PrismaError,
  PrismaErrorCode,
} from '@/common/decorators/prisma-error.decorator';

@Injectable()
export class AssignmentService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  @Log({
    logArgsMessage: ({ assignmentId, studentId }) =>
      `Submitting assignment for assignmentId ${assignmentId} by student ${studentId}`,
    logSuccessMessage: (_, { assignmentId, studentId }) =>
      `Successfully submitted assignment for assignmentId ${assignmentId} by student ${studentId}`,
    logErrorMessage: (err, { assignmentId, studentId }) =>
      `Error submitting assignment for assignmentId ${assignmentId} by student ${studentId}: ${err.message}`,
  })
  @PrismaError({
    [PrismaErrorCode.RecordNotFound]: () =>
      new NotFoundException(
        `Assignment for making the submission is not found`,
      ),
  })
  async submit(
    @LogParam('assignmentId') assignmentId: string,
    @LogParam('studentId') studentId: string,
    submitAssignmentDto: SubmitAssignmentDto,
  ): Promise<AssignmentSubmission> {
    return await this.prisma.client.assignmentSubmission.create({
      data: {
        assignmentId: assignmentId,
        studentId: studentId,
        state: submitAssignmentDto.state,
        content: submitAssignmentDto.content,
        submittedAt:
          submitAssignmentDto.state === 'SUBMITTED' ? new Date() : undefined,
      },
    });
  }

  @Log({
    logArgsMessage: ({ moduleId, filters }) =>
      `Fetching all assignments for admin in module ${moduleId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { moduleId }) =>
      `Successfully fetched ${result.assignments.length} assignments for admin in module ${moduleId}`,
    logErrorMessage: (err, { moduleId }) =>
      `Error fetching assignments for admin in module ${moduleId}: ${err.message}`,
  })
  async findAllForAdmin(
    @LogParam('moduleId') moduleId: string,
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleSection: {
        moduleId,
      },
    };

    const studentCount = await this.prisma.client.courseEnrollment.count({
      where: {
        courseOffering: {
          modules: { every: { id: moduleId } },
        },
      },
    });

    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          _count: {
            select: { submissions: true },
          },
          moduleContent: {
            select: {
              title: true,
              subtitle: true,
              content: true,
            },
          },
          submissions: {
            select: {
              id: true,
              gradeRecord: {
                select: {
                  id: true,
                  grade: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    const assignments = data.map((assignmentItem) => {
      const submitted = assignmentItem._count.submissions;
      const graded = assignmentItem.submissions.filter(
        (item) => item.gradeRecord !== null,
      ).length;

      return {
        ...assignmentItem,
        moduleContentId: assignmentItem.moduleContentId,
        title: assignmentItem.moduleContent.title,
        subtitle: assignmentItem.moduleContent.subtitle,
        content: assignmentItem.moduleContent.content as Prisma.JsonValue[],
        stats: {
          submitted: submitted,
          graded: graded,
          total: studentCount,
        },
      };
    });

    return {
      assignments,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ moduleId, mentorId, filters }) =>
      `Fetching assignments for mentor ${mentorId} in module ${moduleId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { moduleId, mentorId }) =>
      `Successfully fetched ${result.assignments.length} assignments for mentor ${mentorId} in module ${moduleId}`,
    logErrorMessage: (err, { moduleId, mentorId }) =>
      `Error fetching assignments for mentor ${mentorId} in module ${moduleId}: ${err.message}`,
  })
  async findAllForMentor(
    @LogParam('moduleId') moduleId: string,
    @LogParam('mentorId') mentorId: string,
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedMentorAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleSection: {
        moduleId,
        module: {
          courseOffering: {
            courseSections: {
              every: { mentorId },
            },
          },
        },
      },
    };

    const studentCount = await this.prisma.client.courseEnrollment.count({
      where: {
        courseOffering: {
          modules: { every: { id: moduleId } },
          courseSections: {
            every: { mentorId },
          },
        },
      },
    });

    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          _count: {
            select: { submissions: true },
          },
          moduleContent: {
            select: {
              title: true,
              subtitle: true,
              content: true,
            },
          },
          submissions: {
            select: {
              id: true,
              student: true,
              submittedAt: true,
              gradeRecord: {
                select: {
                  id: true,
                  grade: true,
                  rawScore: true,
                  finalScore: true,
                  gradedAt: true,
                },
              },
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    const assignments = data.map((assignment) => {
      const submitted = assignment._count.submissions;
      const graded = assignment.submissions.filter(
        (item) => item.gradeRecord !== null,
      ).length;

      return {
        ...assignment,
        moduleContentId: assignment.moduleContentId,
        title: assignment.moduleContent.title,
        subtitle: assignment.moduleContent.subtitle,
        content: assignment.moduleContent.content as Prisma.JsonValue[],
        submissions: assignment.submissions.map((submissionItem) => {
          const { gradeRecord, ...submission } = submissionItem;
          return {
            ...submission,
            grade: gradeRecord,
          };
        }),

        stats: {
          submitted: submitted,
          graded: graded,
          total: studentCount,
        },
      };
    });

    return {
      assignments,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ moduleId, studentId, filters }) =>
      `Fetching assignments for student ${studentId} in module ${moduleId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { moduleId, studentId }) =>
      `Successfully fetched ${result.assignments.length} assignments for student ${studentId} in module ${moduleId}`,
    logErrorMessage: (err, { moduleId, studentId }) =>
      `Error fetching assignments for student ${studentId} in module ${moduleId}: ${err.message}`,
  })
  async findAllForStudent(
    @LogParam('moduleId') moduleId: string,
    @LogParam('studentId') studentId: string,
    @LogParam('filters') filters: BaseFilterDto,
  ): Promise<PaginatedStudentAssignmentDto> {
    const where: Prisma.AssignmentWhereInput = {};
    const page = filters.page || 1;

    where.moduleContent = {
      moduleSection: {
        moduleId,
      },
    };

    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          moduleContent: true,
          submissions: {
            where: {
              studentId,
            },
            include: {
              gradeRecord: true,
            },
          },
        },
      })
      .withPages({ limit: filters.limit ?? 10, page, includePageCount: true });

    const assignments = data.map((assignment) => ({
      ...assignment,
      moduleContentId: assignment.moduleContent.id,
      title: assignment.moduleContent.title,
      subtitle: assignment.moduleContent.subtitle,
      content: assignment.moduleContent.content as Prisma.JsonValue[],
      submissions: assignment.submissions.map((submissionItem) => {
        const { gradeRecord, ...submission } = submissionItem;
        return {
          ...submission,
          content: submission.content as Prisma.JsonValue[],
          groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
          grade: gradeRecord,
        };
      }),
    }));

    return {
      assignments,
      meta,
    };
  }

  @Log({
    logArgsMessage: ({ moduleContentId }) =>
      `Fetching assignment for moduleContentId ${moduleContentId}`,
    logSuccessMessage: (_, { moduleContentId }) =>
      `Successfully fetched assignment for moduleContentId ${moduleContentId}`,
    logErrorMessage: (err, { moduleContentId }) =>
      `Error fetching assignment for moduleContentId ${moduleContentId}: ${err.message}`,
  })
  async findOne(
    @LogParam('moduleContentId') moduleContentId: string,
  ): Promise<AssignmentDto> {
    return await this.prisma.client.assignment.findFirstOrThrow({
      where: { id: moduleContentId },
    });
  }

  /**
   * Find an assignment for a specific student, including their submissions if any exist
   * @param moduleContentId - The assignment's module content ID
   * @param studentId - The student's ID
   * @returns Assignment data with student submissions (empty array if none)
   */
  @Log({
    logArgsMessage: ({ moduleContentId, studentId }) =>
      `Fetching assignment for student ${studentId} with moduleContentId ${moduleContentId}`,
    logSuccessMessage: (_, { moduleContentId, studentId }) =>
      `Successfully fetched assignment for student ${studentId} with moduleContentId ${moduleContentId}`,
    logErrorMessage: (err, { moduleContentId, studentId }) =>
      `Error fetching assignment for student ${studentId} with moduleContentId ${moduleContentId}: ${err.message}`,
  })
  async findOneForStudent(
    @LogParam('moduleContentId') moduleContentId: string,
    @LogParam('studentId') studentId: string,
  ): Promise<StudentAssignmentItemDto> {
    // Find assignment for student - submissions included if they exist
    const assignment = await this.prisma.client.assignment.findFirstOrThrow({
      where: { moduleContentId },
      include: {
        moduleContent: true,
        submissions: {
          where: { studentId },
          include: { attachments: true, gradeRecord: true },
        },
      },
    });

    return {
      ...assignment,
      title: assignment.moduleContent.title,
      subtitle: assignment.moduleContent.subtitle,
      content: assignment.moduleContent.content as Prisma.JsonValue[],
      submissions: assignment.submissions.map((submission) => ({
        ...submission,
        content: submission.content as Prisma.JsonValue[],
        groupSnapshot: submission.groupSnapshot as Prisma.JsonValue,
        grade: submission.gradeRecord,
      })),
    };
  }

  @Log({
    logArgsMessage: ({ assignmentId }) =>
      `Updating assignment configuration for assignmentId ${assignmentId}`,
    logSuccessMessage: (result, { assignmentId }) =>
      `Successfully updated assignment configuration for assignmentId ${assignmentId}: ${result.message}`,
    logErrorMessage: (err, { assignmentId }) =>
      `Error updating assignment configuration for assignmentId ${assignmentId}: ${err.message}`,
  })
  async update(
    @LogParam('assignmentId') assignmentId: string,
    updateAssignmentDto: UpdateAssignmentConfigDto,
    tx?: PrismaTransaction,
  ): Promise<MessageDto> {
    const client = tx ?? this.prisma.client;
    const rubricId: string | null | undefined =
      updateAssignmentDto?.rubricTemplateId;

    const data: Prisma.AssignmentUpdateInput = {
      ...updateAssignmentDto,
    };

    if (rubricId !== undefined) {
      data.rubricTemplate =
        rubricId === null
          ? { disconnect: true }
          : { connect: { id: rubricId } };
    }

    await client.assignment.update({
      where: { id: assignmentId },
      data,
    });

    return { message: 'Assignment config updated successfully' };
  }

  @Log({
    logArgsMessage: ({ directDelete, assignmentId }) =>
      `Removing assignment for assignmentId ${assignmentId}, directDelete=${directDelete}`,
    logSuccessMessage: (result, { directDelete, assignmentId }) =>
      `Successfully removed assignment for assignmentId ${assignmentId}, directDelete=${directDelete}: ${result.message}`,
    logErrorMessage: (err, { directDelete, assignmentId }) =>
      `Error removing assignment for assignmentId ${assignmentId}, directDelete=${directDelete}: ${err.message}`,
  })
  async remove(
    @LogParam('directDelete') directDelete: boolean,
    @LogParam('assignmentId') assignmentId: string,
    tx?: PrismaTransaction,
  ): Promise<MessageDto> {
    const client = tx ?? this.prisma.client;
    const assignment = await client.assignment.findUnique({
      where: { id: assignmentId },
      include: { submissions: true },
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    if (assignment.submissions.length > 0) {
      throw new BadRequestException(
        'Cannot delete assignments with submissions',
      );
    }

    if (directDelete) {
      await client.assignment.delete({
        where: { id: assignmentId },
      });
      return new MessageDto('Assignment permanently deleted');
    }
    await client.assignment.update({
      where: { id: assignmentId },
      data: { deletedAt: new Date() },
    });

    return new MessageDto('Assignment softly deleted');
  }

  /**
   * Find all assignments/tasks across all enrolled courses for a student
   * Fetches assignments from all modules in courses the student is enrolled in for the current term
   *
   * @param studentId - The student's user ID
   * @param filters - Pagination and filtering options (status, courseId, sorting)
   * @returns Paginated list of all tasks with course and module context
   */
  @Log({
    logArgsMessage: ({ studentId, filters }) =>
      `Fetching all tasks for student ${studentId}, filters=${JSON.stringify(filters)}`,
    logSuccessMessage: (result, { studentId }) =>
      `Successfully fetched ${result.tasks.length} tasks for student ${studentId}`,
    logErrorMessage: (err, { studentId }) =>
      `Error fetching all tasks for student ${studentId}: ${err.message}`,
  })
  async findAllTasksForStudent(
    @LogParam('studentId') studentId: string,
    @LogParam('filters') filters: FilterAllTasksDto,
  ): Promise<PaginatedAllTasksDto> {
    const page = filters.page || 1;
    const limit = filters.limit ?? 10;

    // Build the where clause to find assignments from enrolled courses in the current term
    const where: Prisma.AssignmentWhereInput = {
      deletedAt: null,
      moduleContent: {
        deletedAt: null,
        moduleSection: {
          deletedAt: null,
          module: {
            deletedAt: null,
            courseOffering: {
              deletedAt: null,
              // Filter by current enrollment period (status: active)
              enrollmentPeriod: {
                status: 'active',
              },
              // Filter by student's enrollments
              courseEnrollments: {
                some: {
                  studentId,
                  deletedAt: null,
                },
              },
              // Filter by course if provided
              ...(filters.courseId && {
                courseId: filters.courseId,
              }),
            },
          },
        },
      },
    };

    // Determine sort order
    const sortBy = filters.sortBy || TaskSortBy.DUE_DATE;
    const sortDirection = filters.sortDirection || 'asc';

    let orderBy: Prisma.AssignmentOrderByWithRelationInput[] = [];

    switch (sortBy) {
      case TaskSortBy.DUE_DATE:
        orderBy = [{ dueDate: sortDirection }];
        break;
      case TaskSortBy.TITLE:
        orderBy = [{ moduleContent: { title: sortDirection } }];
        break;
      case TaskSortBy.COURSE:
        orderBy = [
          {
            moduleContent: {
              moduleSection: {
                module: {
                  courseOffering: {
                    course: { name: sortDirection },
                  },
                },
              },
            },
          },
        ];
        break;
      case TaskSortBy.STATUS:
        // Status sorting will be done in-memory after fetching
        orderBy = [{ dueDate: 'asc' }];
        break;
      default:
        orderBy = [{ dueDate: 'asc' }];
    }

    // Fetch paginated assignments with all necessary relations
    const [data, meta] = await this.prisma.client.assignment
      .paginate({
        where,
        include: {
          moduleContent: {
            select: {
              id: true,
              title: true,
              subtitle: true,
              moduleSection: {
                select: {
                  order: true,
                  module: {
                    select: {
                      id: true,
                      title: true,
                      courseOffering: {
                        select: {
                          course: {
                            select: {
                              id: true,
                              name: true,
                              courseCode: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          submissions: {
            where: {
              studentId,
            },
            select: {
              id: true,
              state: true,
              submittedAt: true,
              attemptNumber: true,
              lateDays: true,
              gradeRecord: true,
            },
          },
          rubricTemplate: {
            select: {
              id: true,
            },
          },
        },
        orderBy,
      })
      .withPages({ limit, page, includePageCount: true });

    // Transform the data to match the DTO structure
    let tasks = data.map((assignment) => {
      const module = assignment.moduleContent.moduleSection.module;
      const course = module.courseOffering?.course;

      if (!course) {
        throw new Error('Course offering or course not found for assignment');
      }

      const transformedSubmissions = assignment.submissions.map(
        (submission) => {
          const { gradeRecord, ...submissionData } = submission;
          return {
            ...submissionData,
            grade: gradeRecord,
          };
        },
      );

      return {
        ...assignment,
        moduleContentId: assignment.moduleContentId,
        title: assignment.moduleContent.title,
        subtitle: assignment.moduleContent.subtitle,
        rubricTemplateId: assignment.rubricTemplate?.id ?? null,
        course: {
          id: course.id,
          name: course.name,
          courseCode: course.courseCode,
        },
        module: {
          id: module.id,
          title: module.title,
          sectionOrder: assignment.moduleContent.moduleSection.order,
        },
        submissions: transformedSubmissions,
      };
    });

    // Filter by status if provided
    if (filters.status && filters.status !== TaskStatusFilter.ALL) {
      tasks = tasks.filter((task) => {
        const hasSubmissions = task.submissions.length > 0;
        const hasGrade = hasSubmissions && task.submissions[0].grade !== null;

        switch (filters.status) {
          case TaskStatusFilter.UPCOMING:
            return !hasSubmissions;
          case TaskStatusFilter.SUBMITTED:
            return hasSubmissions && !hasGrade;
          case TaskStatusFilter.GRADED:
            return hasGrade;
          default:
            return true;
        }
      });
    }

    // Sort by status if requested (in-memory sort)
    if (sortBy === TaskSortBy.STATUS) {
      tasks.sort((a, b) => {
        const getStatusOrder = (task: (typeof tasks)[0]) => {
          const hasSubmissions = task.submissions.length > 0;
          const hasGrade = hasSubmissions && task.submissions[0].grade !== null;

          if (hasGrade) return 3; // Graded
          if (hasSubmissions) return 2; // Submitted
          return 1; // Upcoming
        };

        const orderA = getStatusOrder(a);
        const orderB = getStatusOrder(b);

        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      });
    }

    return {
      tasks,
      meta,
    };
  }
}
