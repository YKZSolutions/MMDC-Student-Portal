import {
  Box,
  Button,
  Center,
  Group,
  Modal,
  type ModalProps,
  Select,
  Stepper,
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
import ModuleCreationCard from '@/features/courses/modules/module-creation-card.tsx'
import ModuleReviewStep from '@/features/courses/modules/module-review-step.tsx'
import {
  type CourseNodeModel,
  mockModuleTreeData,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { convertTreeToCourseModules } from '@/utils/helpers.ts'
import { mockCourseBasicDetails } from '@/routes/(protected)/courses/$courseCode.tsx'

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
  const [courseInfo, setCourseInfo] = useState<CourseBasicDetails | undefined>(
    mockCourseBasicDetails.find((course) => course.courseCode === courseCode),
  )
  console.log(courseInfo)

  const [activeStep, setActiveStep] = useState(0)
  const [courseStructure, setCourseStructure] =
    useState<CourseNodeModel[]>(mockModuleTreeData) // TODO: populate this with actual data

  const nextStep = () =>
    setActiveStep((current) => (current < 3 ? current + 1 : current))
  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current))

  // TODO: Populated with the actual course structure data
  useEffect(() => {
    if (opened) {
      // In a real implementation, this would gather data from the state
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
      content: <ModuleCreationCard courseCode={courseCode} />,
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
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      removeScrollProps={{ allowPinchZoom: true }}
      {...props}
      fullScreen={true}
    >
      <Modal.Content h={'100%'} style={{ overflow: 'hidden' }}>
        <Modal.Header h={'10%'}>
          <Button
            variant="subtle"
            onClick={onClose}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>

          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            flex={1}
            maw={900}
          >
            {steps.map((step, index) => (
              <Stepper.Step key={index} icon={step.icon} label={step.label} />
            ))}
          </Stepper>

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
        <Modal.Body
          h={'90%'}
          bg={'background'}
          style={{ overflowY: 'auto', scrollbarGutter: 'stable' }}
        >
          {/* Content */}
          {steps[activeStep].content}
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
    <Center h="90%">
      <Box ta="center">
        <Title order={3} mb="sm">
          Select Course
        </Title>
        <Text c="dimmed" mb="xl">
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
          mb="xl"
          labelProps={{
            fz: '1.5rem',
            fw: 600,
          }}
        />
      </Box>
    </Center>
  )
}

interface ConfirmationStepProps {
  onFinish: () => void
}

const ConfirmationStep = ({ onFinish }: ConfirmationStepProps) => {
  return (
    <Center h="90%">
      <Box ta="center">
        <ThemeIcon color="green" size="xl" radius="xl" mb="md">
          <IconCircleCheck size={24} />
        </ThemeIcon>
        <Title order={3} mb="sm">
          Course Created Successfully!
        </Title>
        <Text c="dimmed" mb="xl">
          Your course has been created and is now ready for students to access.
        </Text>
        <Button onClick={onFinish}>Return to Course Dashboard</Button>
      </Box>
    </Center>
  )
}

export default ModuleCreationProcessModal
