import { z } from 'zod'
import { NAME_MAX_LENGTH, EMAIL_MAX_LENGTH, EMAIL_REGEX } from '../constants/validation.js'

export const profileBodySchema = z.object({
  name: z
    .string({ error: 'Name must be a non-empty string' })
    .trim()
    .min(1, 'Name must be a non-empty string')
    .max(NAME_MAX_LENGTH, `Name must not exceed ${NAME_MAX_LENGTH} characters`),
  email: z
    .string({ error: 'Email must be a valid email address' })
    .trim()
    .min(1, 'Email must be a valid email address')
    .regex(EMAIL_REGEX, 'Email must be a valid email address')
    .max(EMAIL_MAX_LENGTH, `Email must not exceed ${EMAIL_MAX_LENGTH} characters`),
})

export type ProfileBody = z.infer<typeof profileBodySchema>
