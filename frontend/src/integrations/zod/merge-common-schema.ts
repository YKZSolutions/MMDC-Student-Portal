import {
  paginationSearchSchema,
  type PaginationSearchShape,
} from '@/features/pagination/search-validation'
import z, { ZodObject, type ZodRawShape } from 'zod'

export function mergeCommonSearchSchema<TNew extends ZodRawShape>(
  shape: TNew = {} as TNew,
  params?: z.core.$ZodObjectParams,
): ZodObject<PaginationSearchShape & TNew> {
  return z.object(
    {
      ...paginationSearchSchema.shape,
      ...shape,
    },
    params,
  )
}
