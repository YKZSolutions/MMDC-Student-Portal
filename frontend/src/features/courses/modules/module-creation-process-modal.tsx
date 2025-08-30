import {
  Button,
  Container,
  Group,
  Modal,
  type ModalProps,
  Select,
  Stack,
  Stepper,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { useEffect, useState } from 'react'
import {
  IconChecklist,
  IconCircleCheck,
  IconNotebook,
  IconSelect,
  IconX,
} from '@tabler/icons-react'
import ModuleCreationPanel from '@/features/courses/modules/module-creation-panel.tsx'
import ModuleReviewStep from '@/features/courses/modules/module-review-step.tsx'
import {
  type CourseNodeModel,
  mockModuleTreeData,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { convertTreeToCourseModules } from '@/utils/helpers.ts'
import { mockCourseBasicDetails } from '@/routes/(protected)/courses/$courseCode.tsx'
import { useMediaQuery } from '@mantine/hooks'

type ModuleCreationProcessModal = {
  courseCode?: string
} & ModalProps

const ModuleCreationProcessModal = ({
  opened,
  onClose,
  courseCode,
  ...props
}: ModuleCreationProcessModal) => {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)

  // TODO: Populate this with actual course data
  const [courseInfo, setCourseInfo] = useState<CourseBasicDetails | undefined>(
    mockCourseBasicDetails.find((course) => course.courseCode === courseCode),
  )

  const [activeStep, setActiveStep] = useState(0)
  const [courseStructure, setCourseStructure] =
    useState<CourseNodeModel[]>(mockModuleTreeData) // TODO: populate this with actual data

  const nextStep = () => {
    setActiveStep((current) => (current < 3 ? current + 1 : current))
  }
  const prevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current))
  }

  useEffect(() => {
    if (opened) {
      setCourseStructure(mockModuleTreeData)
    }
  }, [opened])

  // Determine if the "Next" button should be enabled
  const isNextEnabled = () => {
    switch (activeStep) {
      case 0:
        return !!courseInfo // Next is enabled only if a course is selected
      // TODO: Add more cases for other steps if they have specific validation needs
      case 1: // Example for Module Management step
      case 2: // Example for Review step
      default:
        return true
    }
  }

  const steps = [
    {
      label: 'Select Course',
      icon: <IconSelect size={18} />,
      content: <CourseSelector onCourseChange={setCourseInfo} />,
    },
    {
      label: 'Module Management',
      icon: <IconNotebook size={18} />,
      content: <ModuleCreationPanel courseCode={courseCode} />,
    },
    {
      label: 'Review',
      icon: <IconChecklist size={18} />,
      content: (
        <ModuleReviewStep
          courseModules={convertTreeToCourseModules(courseStructure)}
          courseInfo={courseInfo as CourseBasicDetails}
        />
      ),
    },
    {
      label: 'Confirmation',
      icon: <IconCircleCheck size={18} />,
      content: <ConfirmationStep onFinish={onClose} />,
    },
  ]

  const stepper = (
    <>
      {isMobile ? (
        <Tabs
          value={steps[activeStep].label}
          onChange={(_value) =>
            setActiveStep(steps.findIndex((step) => step.label === _value) || 0)
          }
          w={'100%'}
        >
          <Tabs.List grow>
            {steps.map((step, index) => (
              <Tabs.Tab key={index} value={step.label}>
                {step.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs>
      ) : (
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          orientation="horizontal"
          size="md"
          maw={900}
          flex={1}
          h="auto"
          p="xl"
        >
          {steps.map((step, index) => (
            <Stepper.Step key={index} icon={step.icon} label={step.label} />
          ))}
        </Stepper>
      )}
    </>
  )

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      removeScrollProps={{ allowPinchZoom: true }}
      {...props}
      fullScreen
      yOffset={0}
      xOffset={0}
    >
      <Modal.Content
        style={{
          overflow: 'hidden',
          width: '100vw',
          height: '100vh',
        }}
      >
        {/* HEADER */}
        <Modal.Header
          style={{
            borderBottom: `${theme.colors.gray[3]} 1px solid`,
            boxShadow: `0px 4px 12px 0px ${theme.colors.gray[3]}`,
            borderRadius: '0',
          }}
          h={isMobile ? 50 : 70}
        >
          <Button
            variant="subtle"
            onClick={onClose}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>

          {!isMobile && stepper}

          <Group>
            <Button
              variant="default"
              onClick={prevStep}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Button onClick={nextStep} w={75} disabled={!isNextEnabled()}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Group>
        </Modal.Header>

        {/* BODY */}
        <Modal.Body
          p={0}
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 70px)',
            overflow: 'hidden',
          }}
        >
          {isMobile && stepper}
          <Stack
            style={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            <Stack flex={'1 0 auto'} style={{ overflow: 'auto' }}>
              {steps[activeStep].content}
            </Stack>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

type CourseSelectorProps = {
  onCourseChange: (course: CourseBasicDetails) => void
}

const CourseSelector = ({ onCourseChange }: CourseSelectorProps) => {
  const courses = mockCourseBasicDetails
  const [selectedCourse, setSelectedCourse] =
    useState<CourseBasicDetails | null>(courses.length > 0 ? courses[0] : null)

  const handleCourseChange = (value: string | null) => {
    if (value) {
      const course = courses.find((course) => course.courseName === value)
      if (course) {
        setSelectedCourse(course)
      }
    } else {
      setSelectedCourse(null)
    }
  }

  useEffect(() => {
    // Call onCourseChange only if a course is selected
    if (selectedCourse) {
      onCourseChange(selectedCourse)
    }
  }, [selectedCourse])

  return (
    <Container h="100%">
      <Stack ta="center" h="100%" mt={'35%'} gap="lg">
        <Title order={3}>Select Course</Title>
        <Text c="dimmed" mb="md">
          Select the course you want to manage content for.
        </Text>
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
            fz: '1.5rem',
            fw: 600,
          }}
        />
      </Stack>
    </Container>
  )
}

interface ConfirmationStepProps {
  onFinish: () => void
}

const ConfirmationStep = ({ onFinish }: ConfirmationStepProps) => {
  return (
    <Container h="100%">
      <Stack ta="center" h="100%" mt={'35%'} align="center">
        <ThemeIcon color="green" size="xl" radius="xl" mb="md">
          <IconCircleCheck size={24} />
        </ThemeIcon>
        <Title order={3} mb="sm">
          Course Created Successfully!
        </Title>
        <Text c="dimmed" mb="xl">
          Your course has been created and is now ready for students to access.
        </Text>
        <Stack>
          <Button variant="default" onClick={onFinish}>
            Manage Other Courses
          </Button>
          <Button onClick={onFinish}>Publish Course</Button>
        </Stack>
      </Stack>
    </Container>
  )
}

export default ModuleCreationProcessModal
