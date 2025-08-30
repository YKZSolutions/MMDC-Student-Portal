export interface CourseBasicDetails {
  courseName: string
  courseCode: string
}

export interface Course {
  courseDetails: CourseBasicDetails,
  courseProgress: number,
  section: Section,
  activities: Activity[]
}

export interface SectionSchedule {
  day: string
  time: string
}

export interface Section {
  sectionName: string
  sectionSchedule: SectionSchedule
  classMeetings: ClassMeeting[]
}

export interface Activity {
  activityName: string
  dueTimestamp: string
}

export interface EnrolledAcademicTerm {
  termId: string
  schoolYear: string
  term: string
  isCurrent: boolean
}

export interface ClassMeeting {
  startTimeStamp: string
  endTimeStamp: string
  meetingLink: string
}

export interface AcademicProgram {
  program: string
  programCode: string
  major: string
  majorCode: string
}


export type ContentType = 'module' | 'subsection' | 'item'