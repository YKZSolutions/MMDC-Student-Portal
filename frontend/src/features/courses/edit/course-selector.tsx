import type { CourseBasicDetails } from '@/features/courses/types.ts'
import React, { useEffect, useState } from 'react'
import {
  Button,
  Container,
  Modal,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { mockCourseBasicDetails } from '@/features/courses/mocks.ts'
import { getRouteApi, useLocation } from '@tanstack/react-router'

const CourseSelector = ({ onClose }: { onClose: () => void }) => {
  const courses = mockCourseBasicDetails
  const [selectedCourse, setSelectedCourse] =
    useState<CourseBasicDetails | null>(courses.length > 0 ? courses[0] : null)

  const route = getRouteApi(`/(protected)/courses/$courseCode`)
  const location = useLocation()
  const navigate = route.useNavigate()
  let courseCode: string | undefined

  try {
    const params = route.useParams()
    courseCode = params?.courseCode
  } catch {
    // Not currently inside /(protected)/courses/$courseCode/*
    courseCode = undefined
  }

  const handleNavigation = async (courseCode: string) => {
    if (!navigate) return
    try {
      await navigate({ to: 'edit', params: { courseCode } })
    } catch (err) {
      console.error('Navigation failed:', err)
    }
  }

  // Auto-navigate only if we have a courseCode and we're not already on /edit
  useEffect(() => {
    if (courseCode && location && !location.pathname.endsWith('/edit')) {
      void handleNavigation(courseCode)
    }
  }, [courseCode, location])

  // If courseCode exists (already on a course route), skip modal entirely
  if (courseCode) {
    return null
  }

  const handleCourseChange = (value: string | null) => {
    if (!value) {
      setSelectedCourse(null)
      return
    }
    const course = courses.find((course) => course.courseName === value)
    if (course) {
      setSelectedCourse(course)
    }
  }

  return (
    <Modal
      title={'Select Course'}
      size={'md'}
      radius={'md'}
      centered
      opened={true} // Always opened if no courseCode
      onClose={onClose}
    >
      <Container h="100%" p="lg">
        <Stack ta="center" h="100%" gap="lg" align={'center'} mb={'md'}>
          <Title order={3}>Select A Course</Title>
          <Text c="dimmed" mb="sm">
            Select the course you want to manage content for.
          </Text>
          <Stack gap="md" maw={300}>
            <Select
              label="Course"
              placeholder="Select a course"
              data={courses.map((course) => course.courseName)}
              value={selectedCourse?.courseName}
              searchable
              onChange={handleCourseChange}
              allowDeselect={false}
              size="md"
              radius="md"
              inputSize="md"
              labelProps={{
                fz: '1.25rem',
                fw: 600,
              }}
            />
            <Button
              onClick={() =>
                handleNavigation(
                  (selectedCourse as CourseBasicDetails).courseCode,
                )
              }
            >
              Proceed
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Modal>
  )
}

export default CourseSelector
