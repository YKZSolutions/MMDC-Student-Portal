import { z } from 'zod'
import { zUserCredentialsDto } from '@/integrations/api/client/zod.gen'

// Extract the individual validators from zUserCredentialsDto
export const emailValidator = z.object({
  email: zUserCredentialsDto.shape.email,
})

export const passwordValidator = z.object({
  password: zUserCredentialsDto.shape.password,
})
