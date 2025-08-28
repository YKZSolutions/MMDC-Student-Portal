import {
  Box,
  Divider,
  Input,
  Modal,
  type ModalProps,
  Stack,
  Textarea,
} from '@mantine/core'

const CourseCreationModal = ({ opened, onClose, ...props }: ModalProps) => {
  return (
    <Modal.Root
      radius="md"
      p={0}
      h={'100%'}
      w={'100%'}
      opened={opened}
      onClose={onClose}
      {...props}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>Modal title</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body>
          <Box bg={'yellow'} h={'64px'}></Box>
          <Stack justify="space-between" h={'100%'} my={'lg'} p={'xl'}>
            <Input
              variant="unstyled"
              placeholder="Course Title"
              fw={600}
              size="2rem"
            />
            {/*TODO: add actual content types, these are just placeholders*/}
            <Stack gap={'sm'}>
              {/*<FormRow label="Category" icon={<IconCategory />} />*/}
              {/*<FormRow label="Title" icon={<IconCategory />} />*/}
              {/*<FormRow label="Description" icon={<IconCategory />} />*/}
              {/*<FormRow label="Tags" icon={<IconCategory />} />*/}
            </Stack>
            <Stack gap={'0'}>
              <Textarea
                variant="unstyled"
                label=""
                placeholder="Type description here..."
              />
              <Divider />
            </Stack>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

export default CourseCreationModal
