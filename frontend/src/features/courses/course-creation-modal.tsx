import {
  Box,
  Card,
  Container,
  Divider,
  Group,
  Modal,
  type ModalProps,
  Select,
  Stack,
  Textarea,
  TextInput,
  useMantineTheme,
} from '@mantine/core'
import { mockCourseBasicDetails } from '@/routes/(protected)/courses/$courseCode.tsx'

const CourseCreationModal = ({
  opened,
  onClose,
  radius,
  ...props
}: ModalProps) => {
  const theme = useMantineTheme()
  const courses = mockCourseBasicDetails

  function handleCourseChange(value: string | null) {
    console.log(value)
  }

  return (
    <Modal.Root size={'lg'} opened={opened} onClose={onClose} {...props}>
      <Modal.Overlay />
      <Modal.Content h={'100%'} style={{ overflow: 'hidden' }} radius={radius}>
        <Modal.Header
          h={'8%'}
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
        <Modal.Body h={'92%'} bg={'background'}>
          <Container h={'100%'} p={'xl'}>
            <Card withBorder radius={'lg'} shadow="xs" p={0} h={'100%'}>
              <Box bg={'yellow'} h={'56px'}></Box>
              <Stack justify="space-between" h={'100%'} my={'sm'} p={'xl'}>
                <Select
                  label="Course"
                  placeholder="Select a course"
                  data={courses.map((course) => course.courseName)}
                  defaultValue={courses[0].courseName}
                  searchable
                  onChange={handleCourseChange}
                  size="lg"
                  radius="md"
                  inputSize="md"
                  labelProps={{
                    fz: '1.5rem',
                  }}
                />
                {/*TODO: add actual content types, these are just placeholders*/}
                <Stack gap={'sm'}>
                  <Group justify="space-between">
                    <TextInput
                      label={'Course Name'}
                      placeholder="Enter course name"
                    />
                    <TextInput
                      label={'Course Code'}
                      placeholder="Enter course code"
                    />
                  </Group>
                  <Group justify="space-between">
                    <TextInput label={'Year Start'} placeholder="Enter year" />
                    <TextInput label={'Year End'} placeholder="Enter year" />
                  </Group>
                  <Group justify="space-between">
                    <TextInput
                      label={'Semester'}
                      placeholder="Enter semester"
                    />
                    <TextInput
                      label={'Units'}
                      type="number"
                      placeholder="Enter units"
                    />
                  </Group>
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
          </Container>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}

export default CourseCreationModal
