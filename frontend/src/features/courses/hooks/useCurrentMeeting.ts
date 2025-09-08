import type { EnrolledCourse } from '@/features/courses/types.ts'
import dayjs from 'dayjs'

export function useCurrentMeeting(course: EnrolledCourse) {
  let start
  let end
  let earlyJoin
  let currentMeeting

  if (!course.section) return { currentMeeting, earlyJoin }

  const now = new Date()

  currentMeeting = course.section.classMeetings.find((meeting) => {
    start = dayjs(meeting.startTimeStamp)
    earlyJoin = start.subtract(15, 'minute').toDate() // 15 minutes before start
    end = dayjs(meeting.endTimeStamp).toDate()
    return now >= earlyJoin && now <= end
  })

  return { currentMeeting, earlyJoin }
}
