import {
  zAppointmentCourseDto,
  zAppointmentsControllerCreateData,
  zAppointmentSectionDto,
  zAppointmentUserDto,
  zUserDto,
} from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodAppointmentCreate = zAppointmentsControllerCreateData.shape.body.shape

export const appointmentFormSchema = z.object({
  // ...zodAppointmentCreate,
  currentMonth: z.string().nullable(),
  courseOfferingId: nullableInput(
    zodAppointmentCreate.courseOfferingId,
    'Course is required',
  ),
  course: nullableInput(zAppointmentCourseDto, 'Course is required'),
  section: nullableInput(zAppointmentSectionDto, 'Section is required'),
  mentor: nullableInput(zAppointmentUserDto, 'Mentor is required'),
  topic: zodAppointmentCreate.title.nonempty(),
  description: zodAppointmentCreate.title,
  date: z.string().nullable(),
  time: z.string(),
})

export type AppointmentFormInput = z.input<typeof appointmentFormSchema>
export type AppointmentFormOutput = z.output<typeof appointmentFormSchema>
