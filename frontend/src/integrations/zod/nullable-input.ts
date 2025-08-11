import { z, type ZodType } from 'zod'

export const nullableInput = <T extends ZodType>(
  schema: T,
  message = 'Output value can not be null',
) => {
  return schema.nullable().transform((val, ctx) => {
    if (val === null) {
      ctx.addIssue({
        code: 'custom',
        fatal: true,
        message,
      })

      return z.NEVER
    }

    return val
  })
}
