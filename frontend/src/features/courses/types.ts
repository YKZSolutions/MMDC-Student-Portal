export interface Course {
  courseName: string,
  courseCode: string,
  courseProgress: number,
  sectionName: string,
  sectionSchedule: {
    day: string,
    time: string
  },
  classMeetings: {
    date: string,
    timeStart: string,
    timeEnd: string,
    meetingLink: string
  }[],
  activities: {
    activityName: string,
    dueTimestamp: string
  }[]
}

export interface EnrolledAcademicTerm {
  termId: string
  schoolYear: string
  term: string
  isCurrent: boolean
}

export interface EnrolledCourse {
    academicTerm: {
        schoolYear: string
        term: string
        isCurrent: boolean
    }
    courses: Course[]
}

export interface ClassMeeting {
  date: string
  timeStart: string
  timeEnd: string
  meetingLink: string
}

export interface CourseDetailProps {
  courseName: string
  courseCode: string
  courseProgress: number
  sectionName: string
  sectionSchedule: {
    day: string
    time: string
  }
  classMeetings: ClassMeeting[]
  onClick: () => void
}