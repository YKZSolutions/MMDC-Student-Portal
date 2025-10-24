import {
  Course,
  Curriculum,
  CurriculumCourse,
  Major,
  Prisma,
  Program,
} from '@prisma/client';

import { log, pickRandom } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createCourseData,
  createMajorData,
  createProgramData,
  createCurriculumData,
  createCurriculumCourseData,
} from '../factories/academic.factory';
import {
  MAJOR_SPECIALIZATIONS,
  PROGRAM_NAMES,
} from '../constants/mockAcademics';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedAcademics(prisma: PrismaTransaction) {
  log('Seeding academics (Programs, Majors, Courses, Curriculums)...');

  // 1. Pre-calculate programs data for batch creation
  const programsToCreate: Prisma.ProgramCreateManyInput[] = [];
  for (const programName of PROGRAM_NAMES) {
    programsToCreate.push(createProgramData(programName));
  }

  // Batch create programs
  if (programsToCreate.length > 0) {
    await prisma.program.createMany({
      data: programsToCreate,
    });
  }

  // Fetch created programs
  const programs = await prisma.program.findMany({
    orderBy: [{ programCode: 'asc' }],
  });
  log(`-> Created ${programs.length} programs.`);

  // 2. Pre-calculate majors data for batch creation
  const majorsToCreate: Prisma.MajorCreateManyInput[] = [];
  for (const specialization of MAJOR_SPECIALIZATIONS) {
    for (const program of programs) {
      majorsToCreate.push(createMajorData(
        specialization,
        program.id,
        program.programCode,
        program.name,
      ));
    }
  }

  // Batch create majors
  if (majorsToCreate.length > 0) {
    await prisma.major.createMany({
      data: majorsToCreate,
    });
  }

  // Fetch created majors
  const majors = await prisma.major.findMany({
    where: {
      programId: {
        in: programs.map(p => p.id),
      },
    },
    include: {
      program: true,
    },
  });
  log(`-> Created ${majors.length} majors.`);

  // 3. Pre-calculate courses data for batch creation
  const coursesToCreate: Prisma.CourseCreateManyInput[] = [];
  const majorToCoursesMap = new Map<string, Course[]>();
  let globalCourseIndex = 0;

  for (const major of majors) {
    const majorCourses: Course[] = [];

    for (let i = 0; i < seedConfig.COURSES_PER_MAJOR; i++) {
      const courseData = createCourseData(globalCourseIndex, major.majorCode);
      coursesToCreate.push(courseData);
      globalCourseIndex++;
    }
  }

  // Batch create courses
  if (coursesToCreate.length > 0) {
    await prisma.course.createMany({
      data: coursesToCreate,
    });
  }

  // Fetch created courses
  const courses = await prisma.course.findMany({
    orderBy: [{ courseCode: 'asc' }],
  });

  // Create major-course relationships
  const majorCourseConnections: Array<{ majorId: string; courseId: string }> = [];
  let courseIndex = 0;

  for (const major of majors) {
    for (let i = 0; i < seedConfig.COURSES_PER_MAJOR; i++) {
      majorCourseConnections.push({
        majorId: major.id,
        courseId: courses[courseIndex].id,
      });
      courseIndex++;
    }
  }

  // Update courses with major relationships
  for (const connection of majorCourseConnections) {
    await prisma.course.update({
      where: { id: connection.courseId },
      data: {
        majors: {
          connect: { id: connection.majorId },
        },
      },
    });
  }

  log(`-> Created ${courses.length} courses and linked to majors.`);

  // 4. Pre-calculate curriculums data for batch creation
  const curriculumsToCreate: Prisma.CurriculumCreateManyInput[] = [];
  for (const major of majors) {
    curriculumsToCreate.push(createCurriculumData(major.id, major.name));
  }

  // Batch create curriculums
  if (curriculumsToCreate.length > 0) {
    await prisma.curriculum.createMany({
      data: curriculumsToCreate,
    });
  }

  // Fetch created curriculums
  const curriculums = await prisma.curriculum.findMany({
    where: {
      majorId: {
        in: majors.map(m => m.id),
      },
    },
    include: {
      major: true,
    },
  });
  log(`-> Created ${curriculums.length} curriculums.`);

  // 5. Pre-calculate curriculum courses data for batch creation
  const curriculumCoursesToCreate: Prisma.CurriculumCourseCreateManyInput[] = [];
  courseIndex = 0;

  for (const curriculum of curriculums) {
    for (let i = 0; i < seedConfig.COURSES_PER_MAJOR; i++) {
      curriculumCoursesToCreate.push(createCurriculumCourseData(
        curriculum.id,
        courses[courseIndex].id,
        i,
      ));
      courseIndex++;
    }
  }

  // Batch create curriculum courses
  if (curriculumCoursesToCreate.length > 0) {
    await prisma.curriculumCourse.createMany({
      data: curriculumCoursesToCreate,
    });
  }

  // Fetch created curriculum courses
  const curriculumCourses = await prisma.curriculumCourse.findMany({
    where: {
      curriculumId: {
        in: curriculums.map(c => c.id),
      },
    },
    include: {
      curriculum: true,
      course: true,
    },
  });
  log(`-> Created ${curriculumCourses.length} curriculum courses.`);

  // 6. Set up some course prerequisites (optional optimization)
  const prereqUpdates: Array<{ courseId: string; prereqId: string }> = [];
  for (const curriculum of curriculums) {
    const curriculumCourseIds = curriculumCourses
      .filter(cc => cc.curriculumId === curriculum.id)
      .map(cc => cc.courseId);

    // Create prerequisites for about half the courses
    for (let i = 0; i < curriculumCourseIds.length / 2; i++) {
      const courseIndex = Math.floor(Math.random() * curriculumCourseIds.length);
      const prereqIndex = Math.floor(Math.random() * curriculumCourseIds.length);

      if (courseIndex !== prereqIndex) {
        prereqUpdates.push({
          courseId: curriculumCourseIds[courseIndex],
          prereqId: curriculumCourseIds[prereqIndex],
        });
      }
    }
  }

  // Update courses with prerequisites in batch
  for (const update of prereqUpdates) {
    await prisma.course.update({
      where: { id: update.courseId },
      data: {
        prereqs: {
          connect: { id: update.prereqId },
        },
      },
    });
  }
  log(`-> Linked ${prereqUpdates.length} course prerequisites.`);

  return { programs, majors, courses, curriculums };
}
