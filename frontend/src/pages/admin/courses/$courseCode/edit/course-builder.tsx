import {
  Box,
  Button,
  Group,
  Stack,
  Stepper,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core'
import React, { useEffect, useState } from 'react'
import {
  IconChecklist,
  IconCircleCheck,
  IconNotebook,
  IconX,
} from '@tabler/icons-react'
import CurriculumManagementPanel from '@/features/courses/modules/curriculum-management-panel.tsx'
import ModuleReviewStep from '@/features/courses/modules/module-review-step.tsx'
import {
  type CourseNodeModel,
  mockCourseTreeData,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { convertTreeToCourseModules } from '@/utils/helpers.ts'
import { useMediaQuery } from '@mantine/hooks'
import { getRouteApi } from '@tanstack/react-router'
import { mockCourseBasicDetails } from '@/features/courses/mocks.ts'

const CourseBuilder = ({ courseCode }: { courseCode: string }) => {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)

  // TODO: Populate this with actual course data
  const [courseInfo, setCourseInfo] = useState<CourseBasicDetails | undefined>(
    courseCode
      ? mockCourseBasicDetails.find(
          (course) => course.courseCode === courseCode,
        )
      : undefined,
  )

  const [activeStep, setActiveStep] = useState(0)
  const [courseStructure, setCourseStructure] =
    useState<CourseNodeModel[]>(mockCourseTreeData) // TODO: populate this with actual data

  const nextStep = () => {
    setActiveStep((current) => (current < 2 ? current + 1 : current))
  }
  const prevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current))
  }

  useEffect(() => {
    if (courseInfo) {
      setCourseStructure(mockCourseTreeData)
    }
  }, [courseInfo])

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
      label: 'Curriculum',
      icon: <IconNotebook size={18} />,
      content: <CurriculumManagementPanel courseCode={courseCode} />,
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
      content: (
        <ConfirmationStep
          onFinish={async () => {
            const route = getRouteApi(`/(protected)/courses/`)
            const navigate = route.useNavigate()
            await navigate({ to: `${courseCode}` })
          }}
        />
      ),
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
          p={'md'}
        >
          {steps.map((step, index) => (
            <Stepper.Step key={index} icon={step.icon} label={step.label} />
          ))}
        </Stepper>
      )}
    </>
  )

  return (
    <Stack p={'md'}>
      {/* HEADER */}
      <Group
        justify="space-between"
        style={{
          borderBottom: `${theme.colors.gray[3]} 1px solid`,
        }}
        p={'md'}
      >
        <Button
          variant="subtle"
          onClick={() => {
            window.history.back()
          }}
          leftSection={<IconX size={16} />}
        >
          Cancel
        </Button>

        <Title order={3} ta={'center'}>
          Course Builder | {courseInfo?.courseName} [{courseInfo?.courseCode}]
        </Title>

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
      </Group>

      <Group justify={'center'}>{!isMobile && stepper}</Group>

      <Box size={'xl'} w={'100%'}>
        {/* BODY */}
        {isMobile && stepper}
        <Stack
          style={{
            flex: 1,
            overflow: 'auto',
            scrollbarGutter: 'stable',
          }}
        >
          <Stack flex={'1 0 auto'}>{steps[activeStep].content}</Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

interface ConfirmationStepProps {
  onFinish: () => void
}

const ConfirmationStep = ({ onFinish }: ConfirmationStepProps) => {
  return (
    <Box h="100%">
      <Stack ta="center" h="100%" align="center">
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
    </Box>
  )
}

export default CourseBuilder
