import { Box, Card, Divider, Input, Stack, Textarea } from '@mantine/core'
import FormRow from '@/components/form-row.tsx'
import { IconCategory } from '@tabler/icons-react'

const CourseCreationCard = () => {
  return (
    <Card radius="lg" p={0} h={'100%'}>
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
          <FormRow label="Category" />
          <FormRow label="Title" icon={<IconCategory />} />
          <FormRow label="Description" placeholder="Enter description" />
          <FormRow label="Tags" />
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
  )
}

export default CourseCreationCard