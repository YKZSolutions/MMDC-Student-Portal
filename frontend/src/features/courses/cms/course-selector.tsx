import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { Group, Select } from '@mantine/core'
import { IconBook } from '@tabler/icons-react'
import React from 'react'

interface CourseSelectorProps {
  courses: CourseBasicDetails[]
  selectedCourse?: CourseBasicDetails
  onCourseChange: (course: CourseBasicDetails | undefined) => void
  onAddContent?: () => void
  showAddButton?: boolean
}

const CourseSelector = ({
  courses,
  selectedCourse,
  onCourseChange,
}: CourseSelectorProps) => {
  return (
    <Group align="center" wrap={'nowrap'}>
      <Select
        data={courses.map((course) => course.courseName)}
        value={selectedCourse?.courseName}
        onChange={(value) => {
          const course = courses.find((c) => c.courseName === value)
          onCourseChange(course)
        }}
        leftSection={<IconBook size={24} />}
        searchable={true}
        flex={1}
      />
    </Group>
  )
}

export default CourseSelector
