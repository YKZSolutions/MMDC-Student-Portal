import type { DetailedTranscriptDto } from '@/integrations/api/client'

export type PartialUpdateTranscript =
  | (Pick<DetailedTranscriptDto, 'id'> & {
      grade: DetailedTranscriptDto['grade']
      gradeLetter?: DetailedTranscriptDto['gradeLetter']
    })
  | (Pick<DetailedTranscriptDto, 'id'> & {
      grade?: DetailedTranscriptDto['grade']
      gradeLetter: DetailedTranscriptDto['gradeLetter']
    })
