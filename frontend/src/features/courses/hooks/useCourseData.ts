import { useEffect, useState } from 'react'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import {
  type ContentNode,
  mockContentNodes,
} from '@/features/courses/modules/types.ts'
import { mockCourseBasicDetails } from '@/features/courses/mocks.ts'

export const useCourseData = (courseCode?: string) => {
  const [courseDetails, setCourseDetails] = useState<CourseBasicDetails>()
  const [courseData, setCourseData] = useState<ContentNode[]>(mockContentNodes)

  useEffect(() => {
    if (courseCode) {
      setCourseDetails(
        mockCourseBasicDetails.find(
          (course) => course.courseCode === courseCode,
        ),
      )
    }
  }, [courseCode])

  const updateCourseData = (data: ContentNode) => {
    setCourseData((prev) =>
      prev.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
    )
  }

  const updateCourseContent = (data: string, itemId?: string) => {
    setCourseData((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, content: data } : item,
      ),
    )
  }

  return {
    courseDetails,
    setCourseDetails,
    courseData,
    updateCourseData,
    updateCourseContent,
  }
}
