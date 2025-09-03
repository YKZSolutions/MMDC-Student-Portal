import type { DetailedCourseEnrollmentDto } from "@/integrations/api/client"



export const isEnrollmentFinalized = (enrolledCourses: DetailedCourseEnrollmentDto[]) => {
  return enrolledCourses.some((c) => c.status === 'finalized')
}