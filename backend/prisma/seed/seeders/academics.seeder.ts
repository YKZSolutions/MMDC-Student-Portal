import { Course, Curriculum, Major, Program } from '@prisma/client';

import { log, pickRandom } from '../utils/helpers';
import { seedConfig } from '../seed.config';
import {
  createCourseData,
  createMajorData,
  createProgramData,
} from '../factories/academic.factory';
import {
  MAJOR_SPECIALIZATIONS,
  PROGRAM_NAMES,
} from '../constants/mockAcademics';
import { PrismaTransaction } from '../../../src/lib/prisma/prisma.extension';

export async function seedAcademics(prisma: PrismaTransaction) {
  log('Seeding academics (Programs, Majors, Courses, Curriculums)...');

  // 1. Create Programs
  const programs: Program[] = [];
  for (const programName of PROGRAM_NAMES) {
    const program = await prisma.program.create({
      data: createProgramData(programName),
    });
    programs.push(program);
  }
  log(`-> Created ${programs.length} programs.`);

  // 2. Create Majors for each Program
  const majors: Major[] = [];
  for (const specialization of MAJOR_SPECIALIZATIONS) {
    for (const program of programs) {
      const major = await prisma.major.create({
        data: createMajorData(
          specialization,
          program.id,
          program.programCode,
          program.name,
        ),
      });

      majors.push(major);
    }
  }
  log(`-> Created ${majors.length} majors.`);

  // 3. Create Courses and link them to Majors
  const courses: Course[] = [];
  const majorCourseMap = new Map<string, Course[]>();
  let index = 0;

  for (const major of majors) {
    // Create courses sequentially to ensure unique course codes
    const createdCourses: Course[] = [];
    for (let i = 0; i < seedConfig.COURSES_PER_MAJOR; i++) {
      const course = await prisma.course.create({
        data: {
          ...createCourseData(index, major.majorCode),
          majors: { connect: { id: major.id } },
        },
      });
      index++;
      createdCourses.push(course);
    }
    courses.push(...createdCourses);
    majorCourseMap.set(major.id, createdCourses);
  }
  log(`-> Created ${courses.length} courses.`);

  // 4. Link some courses as prerequisites
  for (const majorId of Array.from(majorCourseMap.keys())) {
    const majorCourses = majorCourseMap.get(majorId)!;
    for (let i = 0; i < majorCourses.length / 2; i++) {
      const course = pickRandom(majorCourses);
      const prereq = pickRandom(majorCourses.filter((c) => c.id !== course.id));
      await prisma.course.update({
        where: { id: course.id },
        data: { prereqs: { connect: { id: prereq.id } } },
      });
    }
  }
  log(`-> Linked random course prerequisites.`);

  // 5. Create a Curriculum for each Major and add courses to it
  const curriculums: Curriculum[] = [];
  for (const major of majors) {
    const curriculum = await prisma.curriculum.create({
      data: {
        majorId: major.id,
        name: `${major.name} Curriculum`,
        description: `Official curriculum for ${major.name}`,
        courses: {
          create: majorCourseMap.get(major.id)!.map((course, i) => ({
            courseId: course.id,
            order: i + 1,
            year: Math.floor(i / 5) + 1, // Simple logic for year/sem
            semester: (i % 2) + 1,
          })),
        },
      },
    });
    curriculums.push(curriculum);
  }
  log(`-> Created ${curriculums.length} curriculums.`);

  return { programs, majors, courses, curriculums };
}
