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
import { CardWithModal } from '@/components/with-modal.tsx'
import BtnCard from '@/components/btn-card.tsx'

type CourseActionsModalProps = {
  courseCode: string
  opened: boolean
  onClose: () => void
} & ModalProps

const CourseActionsModal = ({
  courseCode,
  opened,
  onClose,
  ...props
}: CourseActionsModalProps) => {
  function handleNavigate() {}
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
            <BtnCard
              title={'Content'}
              description={
                'Create a new educational content that can be used in modules.'
              }
              icon={<IconBook />}
              url={`../edit`}
            />
          </GridCol>
          <GridCol span={6}>
            <BtnCard
              title={'Assignment'}
              description={
                'Create a new assignment or task that students can complete.'
              }
              icon={<IconBook />}
              url={`../edit`}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Student Group'}
              description={
                'Create a new student group that can be used to grade multiple students at once.'
              }
              icon={<IconBook />}
              modalComponent={Modal} //TODO: currently a placeholder
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Progress Report'}
              description={'Create a new progress report that admins can view.'}
              icon={<IconBook />}
              modalComponent={Modal} //TODO: currently a placeholder
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

CourseActionsModal.displayName = 'CourseActionsModal'

export default CourseActionsModal
