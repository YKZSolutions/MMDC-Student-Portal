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
  ActionIcon,
  Tooltip,
  TextInput,
  Combobox,
  useCombobox,
  InputBase,
  Grid,
  Paper,
  Center,
  Progress,
  Select,
  type ComboboxItem,
} from '@mantine/core'
import {
  IconCalendar,
  IconLayoutGridFilled,
  IconList,
  IconMessage,
  IconSearch,
  IconVideo,
} from '@tabler/icons-react'
import { useState } from 'react'
import type { Course, CourseDetailProps, EnrolledAcademicTerm } from '@/features/courses/types.ts'
import { useNavigate } from '@tanstack/react-router'
import CourseTasksSummary from '@/features/courses/course-task-summary.tsx'
import SearchComponent from '@/components/search-component.tsx'

const MockCourseData: Course[] = [
    {
        courseName: 'Web Technology Applications',
        courseCode: 'MO-IT200',
        courseProgress: 0.5,
        sectionName: 'A2101',
        sectionSchedule: {
            day: 'MWF',
            time: '10:00 - 11:00 AM',
        },
        classMeetings: [
            {
                date: '2025-08-20',
                timeStart: '3:00 AM',
                timeEnd: '4:00 AM',
                meetingLink: 'https://zoom.us',
            }
        ],
        activities: []
    },
    {
        courseName: 'Web Technology Applications',
        courseCode: 'MO-IT200',
        courseProgress: 0.5,
        sectionName: 'A2101',
        sectionSchedule: {
            day: 'TTHS',
            time: '10:00 - 11:00 AM',
        },
        classMeetings: [
            {
                date: '2025-08-20',
                timeStart: '3:00 AM',
                timeEnd: '4:00 AM',
                meetingLink: 'https://zoom.us',
            }
        ],
        activities: []
    },
    {
        courseName: 'Web Technology Applications',
        courseCode: 'MO-IT200',
        courseProgress: 0.5,
        sectionName: 'A2101',
        sectionSchedule: {
            day: 'MWF',
            time: '8:00 - 9:00 AM',
        },
        classMeetings: [
            {
                date: '2025-08-20',
                timeStart: '3:00 AM',
                timeEnd: '4:00 AM',
                meetingLink: 'https://zoom.us',
            }
        ],
        activities: []
    },
    {
        courseName: 'Web Technology Applications',
        courseCode: 'MO-IT200',
        courseProgress: 0.5,
        sectionName: 'A2101',
        sectionSchedule: {
            day: 'MWF',
            time: '8:00 - 9:00 AM',
        },
        classMeetings: [
            {
                date: '2025-08-20',
                timeStart: '3:45 PM',
                timeEnd: '10:00 PM',
                meetingLink: 'https://zoom.us',
            }
        ],
        activities: []
    },
    {
        courseName: 'Capstone 2',
        courseCode: 'MO-IT201',
        courseProgress: 0.5,
        sectionName: 'A2101',
        sectionSchedule: {
            day: 'TTHS',
            time: '8:00 - 9:00 AM',
        },
        classMeetings: [
            {
                date: '2025-08-20',
                timeStart: '12:00 AM',
                timeEnd: '11:59 PM',
                meetingLink: 'https://zoom.us',
            }
        ],
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
                <SearchComponent data={coursesData} identifier={'courseName'} setData={setCourses} placeholder={"Search courses"}/>
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
            sectionName={course.sectionName}
            sectionSchedule={course.sectionSchedule}
            classMeetings={course.classMeetings}
            onClick={handleClick}
        />
    ) : (
        <CourseListRow
            courseName={course.courseName}
            courseCode={course.courseCode}
            courseProgress={course.courseProgress}
            sectionName={course.sectionName}
            sectionSchedule={course.sectionSchedule}
            classMeetings={course.classMeetings}
            onClick={handleClick}
        />
    )
}

const CourseCard = ({
  courseName,
  courseCode,
  courseProgress,
  sectionName,
  sectionSchedule,
  classMeetings,
  onClick,
}: CourseDetailProps) => {
    const theme = useMantineTheme()
    const currentMeeting = useCurrentMeeting(classMeetings)
    const [hovered, setHovered] = useState(false)

    return (
    <Card withBorder radius="md" p="xs" shadow={hovered ? 'sm' : 'xs'} style={{cursor: 'pointer'}} onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
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
          <AttendButton meetingLink={currentMeeting?.meetingLink} disabled={!currentMeeting} />
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
            <QuickActions />
          </Group>
        </Stack>
      </Group>
    </Card>
  )
}

const CourseListRow = ({
                         courseName,
                         courseCode,
                         courseProgress,
                         sectionName,
                         sectionSchedule,
                         classMeetings,
                         onClick
                    }: CourseDetailProps) => {
    const theme = useMantineTheme()
    const currentMeeting = useCurrentMeeting(classMeetings)
  const [hovered, setHovered] = useState(false)

    return (
        <Card withBorder radius="md" p="0" shadow={hovered ? 'sm' : 'xs'} w={'100%'} style={{cursor: 'pointer'}}  onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Group justify="space-between" wrap="nowrap">
                <Box bg={theme.colors.primary[1]} h={'100%'} w={'5%'}></Box>
                <Stack w={'65%'} p={'xs'} justify={'space-between'}>
                    <Group gap={'xs'}>
                        <Title order={3} lineClamp={1} maw={'75%'} c={theme.primaryColor} style={{ textDecoration: hovered ? 'underline' : 'none' }}>
                            {courseName}
                        </Title>
                        <QuickActions />
                    </Group>
                    <Text fw={400} size={'sm'} c={theme.colors.dark[3]} style={{ textDecoration: hovered ? 'underline' : 'none' }}>
                        {courseCode} • {sectionName} | {sectionSchedule.day} {sectionSchedule.time}
                    </Text>
                </Stack>
                <Stack w={'30%'} p={'xs'} justify={'space-between'}>
                    <AttendButton meetingLink={currentMeeting?.meetingLink} disabled={!currentMeeting} />
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

const AttendButton = ({ meetingLink, disabled }: { meetingLink?: string; disabled: boolean }) => {
    const theme = useMantineTheme()
    return (
        <Button
            leftSection={<IconVideo/>}
            size="xs"
            radius="xl"
            variant="filled"
            color={theme.colors.primary[0]}
            disabled={disabled}
            onClick={() => {
                if (!disabled && meetingLink) {
                    window.open(meetingLink, '_blank', 'noopener,noreferrer')
                }
            }}
        >
            Attend
        </Button>
    )
}

//TODO: implement action function for booking a mentoring session and navigating to gspace
const QuickActions = () => {
    const theme = useMantineTheme()
    return (
        <Group gap="xs">
            <Tooltip label="Book a Mentoring Session" withArrow color={theme.colors.dark[6]}>
                <ActionIcon color={theme.colors.dark[6]} variant="white" radius="lg" bd={`1px solid ${theme.colors.dark[0]}`}>
                    <IconCalendar size={'60%'} stroke={1.5}/>
                </ActionIcon>
            </Tooltip>
            <Tooltip label="Got to Chat" withArrow color={theme.colors.dark[6]}>
                <ActionIcon color={theme.colors.dark[6]} variant="white" radius="lg" bd={`1px solid ${theme.colors.dark[0]}`}>
                    <IconMessage size={'50%'} stroke={1.5}/>
                </ActionIcon>
            </Tooltip>
        </Group>
    )
}

const toDate = (dateStr: string, timeStr: string) => {
    // dateStr: 'YYYY-MM-DD', timeStr: 'h:mm AM/PM'
    const [y, m, d] = dateStr.split('-').map(Number)
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return new Date(NaN)
    const [, hh, mm, ampm] = match
    let hour = parseInt(hh, 10) % 12
    if (ampm.toUpperCase() === 'PM') hour += 12
    const minute = parseInt(mm, 10)
    return new Date(y, m - 1, d, hour, minute, 0, 0)
}

const useCurrentMeeting = (classMeetings: Course['classMeetings']) => {
    const now = new Date()
    return classMeetings.find((meeting) => {
      const start = toDate(meeting.date, meeting.timeStart)
      const earlyJoin = new Date(start.getTime() - 15 * 60 * 1000) // 15 minutes before start
      const end = toDate(meeting.date, meeting.timeEnd)
      return now >= earlyJoin && now <= end
    })
}

export default CoursesStudentPage