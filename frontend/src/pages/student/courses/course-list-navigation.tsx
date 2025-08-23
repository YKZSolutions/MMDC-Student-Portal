import {
  Box,
  Card,
  Container,
  Divider,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  Image,
  RingProgress,
  useMantineTheme,
  Button,
  Grid,
  Progress,
  Select,
} from '@mantine/core'
import {
  IconDeviceDesktop,
  IconLayoutGridFilled,
  IconList,
  IconVideo,
} from '@tabler/icons-react'
import React, { useState } from 'react'
import type { ClassMeeting, Course, EnrolledAcademicTerm } from '@/features/courses/types.ts'
import { useNavigate } from '@tanstack/react-router'
import CourseTasksSummary from '@/features/courses/course-task-summary.tsx'
import SearchComponent from '@/components/search-component.tsx'
import { useCurrentMeeting } from '@/features/courses/course-editor/useCurrentMeeting.ts'
import { handleMeetingClick } from '@/utils/handlers.ts'
import RoleBasedActionButton from '@/components/role-based-action-button.tsx'
import CourseQuickActions from '@/features/courses/course-quick-actions.tsx'

const MockCourseData: Course[] = [
  {
    courseName: 'Web Technology Applications',
    courseCode: 'MO-IT200',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'MWF',
        time: '10:00 - 11:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T10:00',
          endTimeStamp: '2023-08-20T11:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },

    activities: [],
  },
  {
    courseName: 'Data Structures and Algorithms',
    courseCode: 'MO-IT351',
    courseProgress: 0.5,
    section:{
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'TTHS',
        time: '10:00 - 11:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T10:00',
          endTimeStamp: '2023-08-20T11:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
  },

  {
    courseName: 'Capstone 1',
    courseCode: 'MO-IT400',
    courseProgress: 0.5,
    section:{
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'MWF',
        time: '8:00 - 9:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2023-08-20T15:45',
          endTimeStamp: '2023-08-20T22:00',
          meetingLink: 'https://zoom.us',
        },
      ],
    },
    activities: [],
  },
  {
    courseName: 'Capstone 2',
    courseCode: 'MO-IT500',
    courseProgress: 0.5,
    section: {
      sectionName: 'A2101',
      sectionSchedule: {
        day: 'TTHS',
        time: '8:00 - 9:00 AM',
      },
      classMeetings: [
        {
          startTimeStamp: '2025-08-23T00:00',
          endTimeStamp: '2025-08-29T23:59',
          meetingLink: 'https://zoom.us',
        }
      ],
    },
    activities: [
      {
        activityName: 'Assignment 1',
        dueTimestamp: '2025-08-20T23:59:59',
      },
      {
        activityName: 'Assignment 2',
        dueTimestamp: '2025-08-20T23:59:59',
      }
    ]
  },
]

const CoursesStudentPage = ({ academicTerms }: { academicTerms: EnrolledAcademicTerm[] }) => {
  const theme = useMantineTheme()
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const formatTerm = (academicTerm: EnrolledAcademicTerm | undefined) => {
    return academicTerm ? `${academicTerm.schoolYear} - ${academicTerm.term}` : 'N/A'
  }

  const currentTerm = formatTerm(academicTerms.find((term) => term.isCurrent))

  //TODO: implement API call to get courses, get it by academic term Id
  const coursesData = MockCourseData
  const [courses, setCourses] = useState<Course[]>(coursesData)


  return (
    <Container fluid m={0}>
      <Stack gap={'lg'}>
        {/* Page Hero */}
        <Box>
          <Title c={'dark.7'} variant="hero" order={2} fw={700}>
            All Courses
          </Title>
        </Box>

        <Divider />

        <Grid>
          <Grid.Col span={9}>
            <Stack gap={'md'} mr={'md'}>
              {/*Filters*/}
              <Group justify="space-between" align="start">
                <SearchComponent data={coursesData} identifiers={['courseName']} setData={setCourses} placeholder={"Search courses"}/>
                <Group gap={'md'}>
                  <Select
                    data={academicTerms.map((term) => (`${term.isCurrent ? '(Current)' : ''} ${formatTerm(term)}`))}
                    defaultValue={`(Current) ${currentTerm}`}
                    allowDeselect={false}
                    variant="default"
                    radius={'md'}
                    size={'sm'}
                  />
                  <Button.Group>
                    <Button
                      variant="default"
                      radius={'md'}
                      bg={
                        view === 'grid'
                          ? theme.colors.gray[3]
                          : theme.colors.gray[0]
                      }
                      size={'xs'}
                      onClick={() => setView('grid')}
                    >
                      <IconLayoutGridFilled
                        size="75%"
                        color={view === 'grid' ? 'black' : theme.colors.dark[2]}
                      />
                    </Button>
                    <Button
                      variant="default"
                      radius={'md'}
                      bg={
                        view === 'list'
                          ? theme.colors.gray[3]
                          : theme.colors.gray[0]
                      }
                      size={'xs'}
                      onClick={() => setView('list')}
                    >
                      <IconList
                        size="75%"
                        color={view === 'list' ? 'black' : theme.colors.dark[2]}
                      />
                    </Button>
                  </Button.Group>
                </Group>
              </Group>
              {/*Courses*/}
              <Flex gap={'md'} wrap={'wrap'}>
                {courses.map((course, index) => (
                  <CourseItem key={index} course={course} variant={view} />
                ))}
              </Flex>
            </Stack>
          </Grid.Col>
          {/*Upcoming Tasks*/}
          <Grid.Col span={3}>
            <CourseTasksSummary courses={courses} />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}

const CourseItem = ({ course, variant }: { course: Course; variant: 'grid' | 'list' }) => {
  const navigate = useNavigate()
  const handleClick = async () => {
    await navigate({
      to: `/courses/${course.courseCode}`,
    })
  }
    return variant === 'grid' ? (
        <CourseCard
            courseName={course.courseName}
            courseCode={course.courseCode}
            courseProgress={course.courseProgress}
            section={course.section}
            onClick={handleClick}
        />
    ) : (
        <CourseListRow
            courseName={course.courseName}
            courseCode={course.courseCode}
            courseProgress={course.courseProgress}
            section={course.section}
            onClick={handleClick}
        />
    )
}

const handleManageCourseClick = () => {

}

interface CourseDetailProps extends Omit<Course, 'activities'> {
  onClick: () => void
}

const CourseCard =
  ({
    courseName,
    courseCode,
    courseProgress,
    section,
    onClick,
   }: CourseDetailProps) => {
    const theme = useMantineTheme()
    const { sectionName, sectionSchedule, classMeetings } = section
    const { currentMeeting } = useCurrentMeeting(classMeetings)
    const [hovered, setHovered] = useState(false)

    return (
      <Card
        withBorder
        radius="md"
        p="xs"
        shadow={hovered ? 'sm' : 'xs'}
        style={{cursor: 'pointer'}}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/*Image*/}
        <Flex pos="relative">
          <Image
            src="https://images.unsplash.com/photo-1511275539165-cc46b1ee89bf?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Norway"
            radius='md'
            w='100%'
            h='5.375rem'
          />
          <Text
            pos="absolute"
            top="4px"
            left="4px"
            size="0.625em"
            fw={500}
            c="white"
            px="sm"
            py="xs"
            bdrs="md"
            bg="black"
            opacity={0.75}
            style={{ textDecoration: hovered ? 'underline' : 'none' }}
          >
            {courseCode} • {sectionName}
          </Text>
        </Flex>
        {/*Course Details*/}
        <Group justify="space-between" wrap="nowrap" mt="xs">
          <Stack gap={'md'} w={'16rem'} px={'xs'}>
            <Stack mt={'xs'}>
              <Title order={3} w={'100%'} lineClamp={1} c={theme.primaryColor} style={{ textDecoration: hovered ? 'underline' : 'none' }}>
                {courseName}
              </Title>
              <Text fw={400} size={'sm'} c={theme.colors.dark[3]} style={{ textDecoration: hovered ? 'underline' : 'none' }}>
                {sectionSchedule.day} {sectionSchedule.time}
              </Text>
            </Stack>
            <CourseCardActionButton currentMeeting={currentMeeting} />
            <Group justify="space-between">
              <Group gap="0.25rem">
                <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                  Completed
                </Text>
                <Group gap="0">
                  <RingProgress size={20} thickness={3} sections={[{ value: courseProgress * 100, color: theme.colors.blue[5] }]} />
                  <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                    {courseProgress * 100}%
                  </Text>
                </Group>
              </Group>
              <CourseQuickActions />
            </Group>
          </Stack>
        </Group>
      </Card>
    )
}

const CourseListRow =
  ({
     courseName,
     courseCode,
     courseProgress,
     section,
     onClick,
   }: CourseDetailProps) => {
    const theme = useMantineTheme()
    const { sectionName, sectionSchedule, classMeetings } = section
    const { currentMeeting } = useCurrentMeeting(classMeetings)
    const [hovered, setHovered] = useState(false)

    return (
        <Card
          withBorder
          radius="md"
          p="0"
          shadow={hovered ? 'sm' : 'xs'}
          w={'100%'}
          style={{cursor: 'pointer'}}
          onClick={onClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
            <Group justify="space-between" wrap="nowrap">
                <Box bg={theme.colors.primary[1]} h={'100%'} w={'5%'}></Box>
                <Stack w={'65%'} p={'xs'} justify={'space-between'}>
                    <Group gap={'xs'}>
                        <Title order={3} lineClamp={1} maw={'75%'} c={theme.primaryColor} style={{ textDecoration: hovered ? 'underline' : 'none' }}>
                            {courseName}
                        </Title>
                        <CourseQuickActions />
                    </Group>
                    <Text fw={400} size={'sm'} c={theme.colors.dark[3]} style={{ textDecoration: hovered ? 'underline' : 'none' }}>
                        {courseCode} • {sectionName} | {sectionSchedule.day} {sectionSchedule.time}
                    </Text>
                </Stack>
                <Stack w={'30%'} p={'xs'} justify={'space-between'}>
                  <CourseCardActionButton currentMeeting={currentMeeting} />
                  <Group gap="xs" >
                    <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                      Completed:
                    </Text>
                    <Progress color={theme.colors.blue[5]} value={50} w={'50%'}/>
                    <Text fw={500} size={'xs'} c={theme.colors.dark[3]}>
                      {courseProgress * 100}%
                    </Text>
                  </Group>
                </Stack>
            </Group>
        </Card>
    )
}

const CourseCardActionButton = ({ currentMeeting }: { currentMeeting?: ClassMeeting }) => {
  return (
    <RoleBasedActionButton
      render={{
        student: {
          icon: <IconVideo size={16} />,
          text: 'Join Meeting',
          click: () => handleMeetingClick(currentMeeting?.meetingLink),
          disabled: !currentMeeting
        },
        admin: {
          icon: <IconDeviceDesktop size={16} />,
          text: 'Manage Course',
          click: () => handleManageCourseClick(),
        },
      }}
    />
  )
}


export default CoursesStudentPage