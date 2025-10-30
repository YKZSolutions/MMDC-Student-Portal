import { zLmsSectionControllerCreateData } from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodModuleSectionCreate = zLmsSectionControllerCreateData.shape.body.shape

export const moduleSectionFormSchema = z.object({
  title: zodModuleSectionCreate.title.nonempty('Title is required'),
})

export type ModuleSectionFormInput = z.input<typeof moduleSectionFormSchema>
export type ModuleSectionFormOutput = z.output<typeof moduleSectionFormSchema>
