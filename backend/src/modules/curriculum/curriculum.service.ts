import { Inject, Injectable } from '@nestjs/common';
import { CreateCurriculumWithCoursesDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumWithCourseDto } from './dto/update-curriculum.dto';
import { ExtendedPrismaClient } from '@/lib/prisma/prisma.extension';
import { CustomPrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { CurriculumDto } from '@/generated/nestjs-dto/curriculum.dto';
import { CurriculumWithCoursesDto } from './dto/curriculum-with-course.dto';
import { CurriculumItemDto } from './dto/curriculum-item.dto';

@Injectable()
export class CurriculumService {
  constructor(
    @Inject('PrismaService')
    private prisma: CustomPrismaService<ExtendedPrismaClient>,
  ) {}

  async create(
    createCurriculumDto: CreateCurriculumWithCoursesDto,
  ): Promise<CurriculumDto> {
    return this.prisma.client.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.create({
        data: {
          majorId: createCurriculumDto.majorId,
          ...createCurriculumDto.curriculum,
        },
      });

      const courses = await tx.course.findMany({
        where: {
          courseCode: {
            in: createCurriculumDto.courses.map((course) => course.courseId),
          },
        },
      });

      const payloadMap = new Map(
        createCurriculumDto.courses.map((c) => [c.courseId, c]),
      );

      const createCurriculumCourses: Prisma.CurriculumCourseCreateManyInput[] =
        courses.map((course) => {
          const payload = payloadMap.get(course.id)!;
          return {
            curriculumId: curriculum.id,
            courseId: course.id,
            year: payload.year,
            semester: payload.semester,
            order: payload.order,
          };
        });

      await tx.curriculumCourse.createMany({
        data: createCurriculumCourses,
      });

      return curriculum;
    });
  }

  async findAll(): Promise<CurriculumItemDto[]> {
    const curriculums = (
      await this.prisma.client.curriculum.findMany({
        include: {
          major: {
            include: {
              program: true,
            },
          },
        },
      })
    ).map((items) => {
      const { major: majorItem, ...curriculum } = items;
      const { program, ...major } = majorItem;

      return {
        ...curriculum,
        program: program,
        major: major,
      };
    });

    return curriculums;
  }

  async findOne(id: string): Promise<CurriculumWithCoursesDto> {
    const curriculum = await this.prisma.client.curriculum.findFirstOrThrow({
      where: { id },
      include: {
        major: {
          include: {
            program: true,
          },
        },
      },
    });

    const courses = await this.prisma.client.curriculumCourse.findMany({
      where: {
        curriculumId: curriculum.id,
      },
    });

    const { major: majorItem, ...item } = curriculum;
    const { program, ...major } = majorItem;

    return {
      curriculum: {
        ...item,
        major: major,
        program: program,
      },
      courses,
    };
  }

  async update(
    id: string,
    updateCurriculumDto: UpdateCurriculumWithCourseDto,
  ): Promise<CurriculumDto> {
    return this.prisma.client.$transaction(async (tx) => {
      const curriculum = await tx.curriculum.update({
        where: { id },
        data: {
          majorId: updateCurriculumDto.majorId,
          ...updateCurriculumDto.curriculum,
        },
      });

      for (const course of updateCurriculumDto.courses) {
        await tx.curriculumCourse.upsert({
          where: {
            curriculumId_courseId: {
              curriculumId: id,
              courseId: course.courseId,
            },
          },
          update: {
            year: course.year,
            semester: course.semester,
            order: course.order,
          },
          create: {
            curriculumId: id,
            courseId: course.courseId,
            year: course.year,
            semester: course.semester,
            order: course.order,
          },
        });
      }

      await tx.curriculumCourse.deleteMany({
        where: {
          curriculumId: id,
          courseId: {
            notIn: updateCurriculumDto.courses.map((c) => c.courseId),
          },
        },
      });

      return curriculum;
    });
  }

  async remove(
    id: string,
    directDelete?: boolean,
  ): Promise<{ message: string }> {
    if (!directDelete) {
      const curriculum = await this.prisma.client.curriculum.findFirstOrThrow({
        where: { id },
      });
      if (!curriculum.deletedAt) {
        this.prisma.client.$transaction(async (tx) => {
          await tx.curriculumCourse.updateMany({
            where: { curriculumId: id },
            data: {
              deletedAt: new Date(),
            },
          });

          await tx.curriculum.update({
            where: { id },
            data: {
              deletedAt: new Date(),
            },
          });
        });

        return {
          message: 'Curriculum has been soft deleted',
        };
      }
    }

    this.prisma.client.$transaction(async (tx) => {
      await tx.curriculumCourse.deleteMany({
        where: { curriculumId: id },
      });

      await tx.curriculum.delete({
        where: { id },
      });
    });

    return {
      message: 'Curriculum has been permanently deleted',
    };
  }
}
