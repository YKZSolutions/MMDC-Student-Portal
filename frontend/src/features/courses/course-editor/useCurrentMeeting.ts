import type { ClassMeeting } from '@/features/courses/types.ts'
import dayjs from 'dayjs'

export function useCurrentMeeting(classMeetings: ClassMeeting[]){
  const now = new Date()
  let start;
  let end;
  let earlyJoin;

  const currentMeeting = classMeetings.find((meeting) => {
    start = dayjs(meeting.startTimeStamp);
    earlyJoin = start.subtract(15, 'minute').toDate() // 15 minutes before start
    end = dayjs(meeting.endTimeStamp).toDate();
    return now >= earlyJoin && now <= end
  })

  return { currentMeeting, earlyJoin}
}
