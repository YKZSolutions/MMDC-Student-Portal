import { zProgramControllerCreateData } from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodProgramCreate = zProgramControllerCreateData.shape.body.shape

export const programFormSchema = z.object({
  ...zodProgramCreate,
  programCode: zodProgramCreate.programCode.nonempty(
    'Program should have a code',
  ),
  name: zodProgramCreate.name.nonempty('Name should not be empty'),
  description: zodProgramCreate.description,
  yearDuration: nullableInput(
    zodProgramCreate.yearDuration,
    'Year duration is required',
  ),
})

export type ProgramFormInput = z.input<typeof programFormSchema>
export type ProgramFormOutput = z.output<typeof programFormSchema>
