export interface CourseBasicDetails {
  courseName: string
  courseCode: string
}

export interface Course {
  courseName: string
  courseCode: string
  programs: AcademicProgram[]
  academicTerms: AcademicTerm[]
  sections?: Section[]
}

export interface EnrolledCourse {
  courseName: string
  courseCode: string
  courseProgress: number
  section: Section
  activities: Activity[]
  program: AcademicProgram
  academicTerm: AcademicTerm
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

export interface AcademicTerm {
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
