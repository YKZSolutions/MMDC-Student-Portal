import { zMajorControllerCreateData } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodMajorCreate = zMajorControllerCreateData.shape.body.shape
const zodMajor = zodMajorCreate.major.shape

export const majorFormSchema = z.object({
  majorCode: zodMajor.majorCode.nonempty('Major should have a code'),
  name: zodMajor.name.nonempty('Name should not be empty'),
  description: zodMajor.description,
})

export type MajorFormInput = z.input<typeof majorFormSchema>
export type MajorFormOutput = z.output<typeof majorFormSchema>
