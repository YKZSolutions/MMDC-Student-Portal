import { zTranscriptControllerUpdateData } from '@/integrations/api/client/zod.gen'
import { nullableInput } from '@/integrations/zod/nullable-input'
import z from 'zod'

const zodTranscriptEdit = zTranscriptControllerUpdateData.shape.body.shape

export const GRADE_OPTIONS = [
  { value: '1.0', label: '1.0' },
  { value: '1.25', label: '1.25' },
  { value: '1.5', label: '1.5' },
  { value: '1.75', label: '1.75' },
  { value: '2.0', label: '2.0' },
  { value: '2.25', label: '2.25' },
  { value: '2.5', label: '2.5' },
  { value: '2.75', label: '2.75' },
  { value: '3.0', label: '3.0' },
  { value: '5.0', label: '5.0 - Incomplete' },
]

export const GRADE_LETTER_OPTIONS = zodTranscriptEdit.gradeLetter
  .unwrap()
  .options.map((option) => ({
    value: option,
    label: option.charAt(0).toUpperCase() + option.slice(1),
  }))

const zGradeEnum = z.enum(GRADE_OPTIONS.map((option) => option.value))

export const transcriptEditFormSchema = z.object({
  ...zodTranscriptEdit,
  grade: nullableInput(z.enum(zGradeEnum.options)),
  gradeLetter: nullableInput(zodTranscriptEdit.gradeLetter),
})

export type TranscriptEditFormInput = z.input<typeof transcriptEditFormSchema>
export type TranscriptEditFormOutput = z.output<typeof transcriptEditFormSchema>
