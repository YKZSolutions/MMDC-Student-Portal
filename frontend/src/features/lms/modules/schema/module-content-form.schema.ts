import { zLmsContentControllerCreateData } from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodModuleContentCreate = zLmsContentControllerCreateData.shape.body.shape

export const moduleContentFormSchema = z.object({
  title: zodModuleContentCreate.title.nonempty('Title is required'),
  contentType: nullableInput(
    zodModuleContentCreate.contentType,
    'Content Type is required',
  ),
})

export type ModuleContentFormInput = z.input<typeof moduleContentFormSchema>
export type ModuleContentFormOutput = z.output<typeof moduleContentFormSchema>
