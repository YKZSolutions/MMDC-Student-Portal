import { zCoursesControllerCreateData } from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodCourseCreate = zCoursesControllerCreateData.shape.body.shape

export const courseFormSchema = z.object({
  ...zodCourseCreate,
  courseCode: zodCourseCreate.courseCode.nonempty('Course should have a code'),
  name: zodCourseCreate.name.nonempty('Name should not be empty'),
  description: zodCourseCreate.description,
  units: nullableInput(zodCourseCreate.units, 'Employee number is required'),
  // majorIds: nullableInput(
  //   zodCourseCreate.majorIds,
  //   'Employee number is required',
  // ),
})

export type CourseFormInput = z.input<typeof courseFormSchema>
export type CourseFormOutput = z.output<typeof courseFormSchema>
