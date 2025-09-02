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
  useModalsStack,
} from '@mantine/core'
import { IconBook } from '@tabler/icons-react'
import { CardWithModal } from '@/components/with-modal.tsx'
import BtnCard from '@/components/btn-card.tsx'
import CourseSelectorModal from '@/features/courses/edit/course-selector-modal.tsx'
import React, { useState } from 'react'

const CourseActionsModal = ({ opened, onClose, ...props }: ModalProps) => {
  const [isCourseSelectorOpen, setIsCourseSelectorOpen] = useState(false)
  const stack = useModalsStack(['first', 'second'])

  return (
    <Modal
      {...stack.register('first')}
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
              modalComponent={Modal}
            />
          </GridCol>
          <GridCol span={6}>
            <BtnCard
              title={'Module'}
              description={
                'Create a new module that contains assignments and other content.'
              }
              icon={<IconBook />}
              onClick={() => {
                setIsCourseSelectorOpen(true)
              }}
            />
            {isCourseSelectorOpen && (
              <CourseSelectorModal
                {...stack.register('second')}
                onClose={() => setIsCourseSelectorOpen(false)}
              />
            )}
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Content'}
              description={
                'Create a new educational content that can be used in modules.'
              }
              icon={<IconBook />}
              modalComponent={Modal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Assignment'}
              description={
                'Create a new assignment or task that students can complete.'
              }
              icon={<IconBook />}
              modalComponent={Modal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Student Group'}
              description={
                'Create a new student group that can be used to grade multiple students at once.'
              }
              icon={<IconBook />}
              modalComponent={Modal}
            />
          </GridCol>
          <GridCol span={6}>
            <CardWithModal
              title={'Progress Report'}
              description={'Create a new progress report that admins can view.'}
              icon={<IconBook />}
              modalComponent={Modal}
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
