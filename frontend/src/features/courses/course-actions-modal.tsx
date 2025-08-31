import {
  Button,
  Divider,
  Flex,
  Grid,
  GridCol,
  Modal,
  type ModalProps,
  Stack,
  Title,
} from '@mantine/core'
import { IconBook } from '@tabler/icons-react'
import ModuleCreationProcessModal from '@/features/courses/modules/module-creation-process-modal.tsx'
import { CardWithModal } from '@/components/with-modal.tsx'

const CourseActionsModal = ({ opened, onClose, ...props }: ModalProps) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Manage Content</Title>}
      centered
      size="lg"
      radius={'md'}
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 1,
      }}
      {...props}
    >
      <Stack gap={'sm'}>
        <Divider></Divider>
        <Grid my={'sm'}>
          {/*TODO: add more content types, these are just placeholders*/}
          {/*Modal for each content type are currently not implemented*/}
          <GridCol span={6}>
            <CardWithModal
              title={'Course'}
              description={'Create a new course that students can enroll in.'}
              icon={<IconBook />}
              modalComponent={ModuleCreationProcessModal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Module'}
              description={
                'Create a new module that contains assignments and other content.'
              }
              icon={<IconBook />}
              modalComponent={ModuleCreationProcessModal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Content'}
              description={
                'Create a new educational content that can be used in modules.'
              }
              icon={<IconBook />}
              modalComponent={ModuleCreationProcessModal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Assignment'}
              description={
                'Create a new assignment or task that students can complete.'
              }
              icon={<IconBook />}
              modalComponent={ModuleCreationProcessModal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Student Group'}
              description={
                'Create a new student group that can be used to grade multiple students at once.'
              }
              icon={<IconBook />}
              modalComponent={ModuleCreationProcessModal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Progress Report'}
              description={'Create a new progress report that admins can view.'}
              icon={<IconBook />}
              modalComponent={ModuleCreationProcessModal}
            />
          </GridCol>
        </Grid>
        <Divider></Divider>
        <Flex justify="flex-end">
          <Button
            variant={'default'}
            radius={'md'}
            size={'sm'}
            onClick={onClose}
          >
            Cancel
          </Button>
        </Flex>
      </Stack>
    </Modal>
  )
}

export default CourseActionsModal
