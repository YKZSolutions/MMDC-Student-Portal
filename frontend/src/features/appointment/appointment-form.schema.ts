import { zAppointmentsControllerCreateData } from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodAppointmentCreate = zAppointmentsControllerCreateData.shape.body.shape

export const appointmentFormSchema = z.object({
  // ...zodAppointmentCreate,
  course: nullableInput(
    zodAppointmentCreate.courseOfferingId,
    'Course is required',
  ),
  mentor: nullableInput(zodAppointmentCreate.mentorId, 'Mentor is required'),
  topic: zodAppointmentCreate.title.nonempty(),
  description: zodAppointmentCreate.title.nonempty(),
  date: z.string().nullable(),
  time: z.string(),
})

export type AppointmentFormInput = z.input<typeof appointmentFormSchema>
export type AppointmentFormOutput = z.output<typeof appointmentFormSchema>
