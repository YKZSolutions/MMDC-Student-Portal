import {
    commonSearchSchema,
    type CommonShape,
} from '@/features/validation/common-search.schema'
import z, { ZodObject, type ZodRawShape } from 'zod'

export function mergeCommonSearchSchema<TNew extends ZodRawShape>(
  shape: TNew = {} as TNew,
  params?: z.core.$ZodObjectParams,
): ZodObject<CommonShape & TNew> {
  return z.object(
    {
      ...commonSearchSchema.shape,
      ...shape,
    },
    params,
  )
}
