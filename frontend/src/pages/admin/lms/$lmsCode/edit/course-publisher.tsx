import { mockModule } from '@/features/courses/mocks.ts'
import ModuleReviewStep from '@/features/courses/modules/module-review-step.tsx'
import { type Module } from '@/features/courses/modules/types.ts'
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
import { useMediaQuery } from '@mantine/hooks'
import { IconChecklist, IconCircleCheck, IconX } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

type CoursePublisherProps = {
  courseCode: string
  scheduled: boolean
}

const CoursePublisher = ({ courseCode, scheduled }: CoursePublisherProps) => {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`)
  const [module, setModule] = useState<Module | null>(mockModule)

  useEffect(() => {
    setModule(mockModule) //TODO: fetch module from backend
  }, [courseCode])

  const [activeStep, setActiveStep] = useState(0)

  const nextStep = () => {
    setActiveStep((current) => (current < 2 ? current + 1 : current))
  }
  const prevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current))
  }

  if (!module) {
    return <div>Loading...</div>
  } //TODO: handle error

  const steps = [
    {
      label: 'Review',
      icon: <IconChecklist size={18} />,
      content: <ModuleReviewStep module={module} />,
    },
    {
      label: 'Confirmation',
      icon: <IconCircleCheck size={18} />,
      content: (
        <ConfirmationStep
          onFinish={async () => {
            const route = getRouteApi(`/(protected)/lms/`)
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
          Course Publisher | {module?.courseName} [{module?.courseCode}]
        </Title>

        <Group>
          <Button
            variant="default"
            onClick={prevStep}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button onClick={nextStep} w={75}>
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

export default CoursePublisher
