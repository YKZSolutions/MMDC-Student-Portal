import {
  Button,
  Group,
  Modal,
  Stack,
  Stepper,
  useMantineTheme,
} from '@mantine/core'
import { useState } from 'react'
import {
  IconChecklist,
  IconCircleCheck,
  IconNotebook,
  IconPencil,
  IconX,
} from '@tabler/icons-react'
import ModuleCreationCard from '@/features/courses/module-creation-card.tsx'
import type { CustomModalProp } from '@/components/types.ts'

const ModuleCreationProcessModal = ({
  opened,
  closeModal,
}: CustomModalProp) => {
  const theme = useMantineTheme()
  const [activeStep, setActiveStep] = useState(0)

  const nextStep = () =>
    setActiveStep((current) => (current < 3 ? current + 1 : current))
  const prevStep = () =>
    setActiveStep((current) => (current > 0 ? current - 1 : current))

  const steps = [
    {
      label: 'Course Details',
      description: 'Identify the course',
      icon: <IconPencil size={18} />,
      content: '<CourseDetailsForm onNext={nextStep} />',
    },
    {
      label: 'Module Management',
      description: 'Organize course content',
      icon: <IconNotebook size={18} />,
      content: <ModuleCreationCard />,
    },
    {
      label: 'Review',
      description: 'Confirm your settings',
      icon: <IconChecklist size={18} />,
      content: '<ReviewStep onNext={nextStep} />',
    },
    {
      label: 'Confirmation',
      description: 'Course created successfully',
      icon: <IconCircleCheck size={18} />,
      content: '<ConfirmationStep onFinish={closeModal} />',
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

export default ModuleCreationProcessModal
