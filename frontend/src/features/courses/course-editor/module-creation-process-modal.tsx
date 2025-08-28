import {
  Box,
  Button,
  Center,
  Group,
  Modal,
  Stack,
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
  IconX,
} from '@tabler/icons-react'
import CourseModuleCreationCard from '@/features/courses/modules/course-module-creation-card.tsx'
import type { CustomModalProp } from '@/components/types.ts'
import CourseModuleReviewStep from '@/features/courses/modules/course-module-review-step.tsx'
import {
  type CourseNodeModel,
  mockModuleTreeData,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import { useParams } from '@tanstack/react-router'
import { mockCourseBasicDetails } from '@/routes/(protected)/courses/$courseCode.tsx'
import { convertTreeToCourseModules } from '@/utils/helpers.ts'

const ModuleCreationProcessModal = ({
  opened,
  closeModal,
}: CustomModalProp) => {
  const theme = useMantineTheme()
  const { courseCode } = useParams({
    from: '/(protected)/courses/$courseCode/modules/',
  })
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

  const steps = [
    {
      label: 'Module Management',
      description: 'Organize course content',
      icon: <IconNotebook size={18} />,
      content: <CourseModuleCreationCard />,
    },
    {
      label: 'Review',
      description: 'Confirm your settings',
      icon: <IconChecklist size={18} />,
      content: (
        <CourseModuleReviewStep
          onNext={nextStep}
          onBack={prevStep}
          courseModules={convertTreeToCourseModules(courseStructure)}
          courseInfo={courseInfo as CourseBasicDetails}
        />
      ),
    },
    {
      label: 'Confirmation',
      description: 'Course created successfully',
      icon: <IconCircleCheck size={18} />,
      content: <ConfirmationStep onFinish={closeModal} />,
    },
  ]

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      withCloseButton={false}
      fullScreen={true}
      styles={{
        body: {
          height: '100%',
          padding: 0,
        },
      }}
    >
      <Stack gap={0} h="100%">
        {/* Header */}
        <Group
          justify="space-between"
          align="center"
          p={'lg'}
          style={{
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            boxShadow: `0px 4px 24px 0px ${theme.colors.gray[3]}`,
          }}
        >
          <Button
            variant="subtle"
            onClick={closeModal}
            leftSection={<IconX size={16} />}
          >
            Cancel
          </Button>

          <Stepper
            w={'50%'}
            active={activeStep}
            onStepClick={setActiveStep}
            size="sm"
          >
            {steps.map((step, index) => (
              <Stepper.Step
                key={index}
                icon={step.icon}
                label={step.label}
                description={
                  activeStep === index ? step.description : undefined
                }
              />
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
            <Button onClick={nextStep} w={75}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Group>
        </Group>

        {/* Content */}
        {steps[activeStep].content}
      </Stack>
    </Modal>
  )
}

interface ConfirmationStepProps {
  onFinish: () => void
}

const ConfirmationStep = ({ onFinish }: ConfirmationStepProps) => {
  return (
    <Center h="100%">
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
