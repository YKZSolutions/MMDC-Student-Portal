import { Button, Card, Group, Stack, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import CourseTree from '@/features/courses/course-editor/course-tree.tsx'

const ModuleCreationCard = ({onAddButtonClick}: {onAddButtonClick: (parentId: string | number, parentType: string) => void}) => {
  return (
    <Card radius="lg" p={0} h={'100%'}>
      <Group justify="space-between" align="center" p={'xs'}>
        <Title order={3}>Module Management</Title>
        <Button
          variant="default"
          radius={'md'}
          p={'xs'}
          leftSection={<IconPlus size={18} />}
          onClick={() => onAddButtonClick}
        >
          Add New
        </Button>
      </Group>
      <Stack justify="space-between" h={'100%'} my={'lg'} p={'lg'}>
        <CourseTree onAddButtonClick={onAddButtonClick} />
      </Stack>
    </Card>
  )
}

export default ModuleCreationCard