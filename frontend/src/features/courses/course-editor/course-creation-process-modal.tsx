import {
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Stepper,
  useMantineTheme,
} from '@mantine/core'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { getChildTypeFromParentType } from '@/utils/helpers.ts'
import {
  IconArrowsLeft,
  IconCircleCheck,
  IconNotebook,
  IconPencil,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ContentDetailsEditor from '@/features/courses/course-editor/content-details-editor.tsx'
import ModuleCreationCard from '@/features/courses/module-creation-card.tsx'
import CourseCreationCard from '@/features/courses/course-creation-card.tsx'
import type { CustomModalProp } from '@/components/types.ts'
import type { ContentNodeType } from '@/features/courses/modules/types.ts'

const CourseCreationProcessModal = ({
  opened,
  closeModal,
}: CustomModalProp) => {
  const theme = useMantineTheme()
  const [active, setActive] = useState(0)
  const nextStep = () =>
    setActive((current) => (current < 3 ? current + 1 : current))
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current))

  const [isDragging, setIsDragging] = useState(false)

  const [rightPaneOpen, { open, close }] = useDisclosure(false) //For Content Details Editor Drawer
  const [childType, setChildType] = useState<ContentNodeType>('module')

  const handleAdd = (parentId?: string | number, parentType?: string) => {
    setChildType(getChildTypeFromParentType(parentType))
    open()
  }

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      withCloseButton={false}
      // size="60%"
      fullScreen={true}
      bg={'red'}
      styles={{
        body: {
          height: '100%',
          padding: 0,
        },
      }}
    >
      <Stack gap={0} h={'100%'}>
        {/*Header*/}
        <Group
          justify="space-between"
          align="center"
          p={'lg'}
          style={{
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            boxShadow: `0px 4px 24px 0px ${theme.colors.gray[3]}`,
          }}
        >
          <Button variant="outline" radius={'md'} p={'xs'} onClick={closeModal}>
            <IconX size={18} />
          </Button>
          <Stepper
            w={'75%'}
            active={active}
            onStepClick={setActive}
            completedIcon={<IconCircleCheck size={18} />}
            allowNextStepsSelect={false}
          >
            <Stepper.Step
              icon={<IconPencil size={18} />}
              label="Step 1"
              description="Identify the course"
            />
            <Stepper.Step
              icon={<IconNotebook size={18} />}
              label="Step 2"
              description="Manage modules"
            />
            <Stepper.Step
              icon={<IconShieldCheck size={18} />}
              label="Step 3"
              description="Get full access"
            />
          </Stepper>
          <Group gap={'xs'} align="center">
            <Button variant="default" radius={'md'} p={'xs'} onClick={prevStep}>
              <IconArrowsLeft size={18} />
            </Button>
            <Button radius={'md'} size={'sm'} onClick={nextStep}>
              {active === 3 ? 'Save' : 'Next'}
            </Button>
          </Group>
        </Group>
        {/*Resizable Panel Component docs: https://react-resizable-panels.vercel.app/ */}
        <PanelGroup direction="horizontal" autoSaveId="persistence">
          <Panel>
            <Container w={'70%'} p={'xl'} h={'100%'}>
              {active === 0 && <CourseCreationCard />}
              {active === 1 && (
                <ModuleCreationCard onAddButtonClick={handleAdd} />
              )}
              {active === 2 && <div>Nothing</div>}
              {active === 3 && <div>Final step placeholder</div>}
            </Container>
          </Panel>
          <PanelResizeHandle
            disabled={!rightPaneOpen}
            onDragging={setIsDragging}
          />
          <Panel
            defaultSize={30}
            minSize={25}
            hidden={!rightPaneOpen}
            style={{
              borderLeft: `1px solid ${rightPaneOpen ? (isDragging ? theme.colors.blue[5] : theme.colors.gray[3]) : 'transparent'}`,
              boxShadow: `0px 8px 24px 0px ${theme.colors.gray[5]}`,
              zIndex: 1,
            }}
          >
            <ContentDetailsEditor
              opened={rightPaneOpen}
              onClose={close}
              type={childType}
              data={''}
              gap="lg"
              h="100%"
              p="lg"
              m={'xs'}
              style={{
                overflowY: 'auto',
                scrollbarGutter: 'stable',
              }}
            />
          </Panel>
        </PanelGroup>
      </Stack>
    </Modal>
  )
}

export default CourseCreationProcessModal
