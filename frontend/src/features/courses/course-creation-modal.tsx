import {
  Box,
  Card,
  Center,
  Divider,
  Input,
  Modal,
  type ModalProps,
  Stack,
  Textarea,
  useMantineTheme,
} from '@mantine/core'

const CourseCreationModal = ({ opened, onClose, ...props }: ModalProps) => {
  const theme = useMantineTheme()
  return (
    <Modal.Root
      radius="md"
      size={'lg'}
      opened={opened}
      onClose={onClose}
      {...props}
    >
      <Modal.Overlay />
      <Modal.Content h={'100%'} style={{ overflow: 'hidden' }}>
        <Modal.Header
          style={{
            borderBottom: `${theme.colors.gray[3]} 1px solid`,
            boxShadow: `0px 4px 12px 0px ${theme.colors.gray[3]}`,
          }}
        >
          <Modal.Title fw={600} fz={'h3'}>
            Manage Course
          </Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body h={'100%'} bg={'background'}>
          <Center h={'100%'} p={'xl'}>
            <Card withBorder radius={'md'} shadow="xs" p={0} h={'100%'}>
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
            </Card>
          </Center>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

export default CourseCreationModal
