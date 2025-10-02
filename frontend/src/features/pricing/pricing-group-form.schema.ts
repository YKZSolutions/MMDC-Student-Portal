import {
  zPricingDto,
  zPricingGroupControllerCreateData,
} from '@/integrations/api/client/zod.gen'
import z from 'zod'

const zodPricingGroupCreate = zPricingGroupControllerCreateData.shape.body.shape
const zodPricingGroup = zodPricingGroupCreate.group.shape

export const pricingGroupFormSchema = z.object({
  name: zodPricingGroup.name.nonempty('Name should not be empty'),
  pricings: z.array(zPricingDto),
})

export type PricingGroupFormInput = z.input<typeof pricingGroupFormSchema>
export type PricingGroupFormOutput = z.output<typeof pricingGroupFormSchema>
