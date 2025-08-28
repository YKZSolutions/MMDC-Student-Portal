import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { IconEye, IconInfoCircle, IconListCheck } from '@tabler/icons-react'
import ModuleListPanel from '@/features/courses/modules/module-list-panel.tsx'
import {
  type CourseModule,
  type ModuleItem,
  type ModuleSection,
} from '@/features/courses/modules/types.ts'
import type { CourseBasicDetails } from '@/features/courses/types.ts'

interface ReviewStepProps {
  onNext: () => void
  onBack: () => void
  courseModules: CourseModule[]
  courseInfo: CourseBasicDetails
}

const ModuleReviewStep = ({
  onNext,
  onBack,
  courseModules,
  courseInfo,
}: ReviewStepProps) => {
  // Count total number of modules
  // By iterating over courseModules array and summing the length of sections
  // for each module
  const totalModules = courseModules.length

  // Count total number of sections
  // By iterating over courseModules array and summing the length of items
  // for each section
  const totalSections = courseModules.reduce(
    (acc, module) => acc + module.sections.length,
    0,
  )

  // Count total number of items
  // By iterating over courseModules array and iterating over sections for each
  // module. For each section, sum the length of items.
  const totalItems = courseModules.reduce(
    (acc, module) =>
      acc +
      module.sections.reduce(
        (secAcc, section) => secAcc + section.items.length,
        0,
      ),
    0,
  )

  return (
    <Container p="xl">
      <Title order={3} mb="lg">
        Review Course Structure
      </Title>

      <Alert icon={<IconInfoCircle size={16} />} mb="xl" color="blue">
        Please review your course structure before finalizing. You can go back
        to make changes if needed.
      </Alert>

      {/* Course Summary */}
      <Card withBorder mb="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>Course Summary</Title>
          <Badge variant="light" color="blue" size="lg">
            {courseInfo.courseName}
          </Badge>
        </Group>

        <Group grow>
          <Stack align="center" gap={'xs'}>
            <Text size="xl" fw={700}>
              {totalModules}
            </Text>
            <Text c="dimmed">Modules</Text>
          </Stack>
          <Stack align="center" gap={'xs'}>
            <Text size="xl" fw={700}>
              {totalSections}
            </Text>
            <Text c="dimmed">Sections</Text>
          </Stack>
          <Stack align="center" gap={'xs'}>
            <Text size="xl" fw={700}>
              {totalItems}
            </Text>
            <Text c="dimmed">Content Items</Text>
          </Stack>
        </Group>
      </Card>

      {/* Preview Tabs */}
      <Tabs defaultValue="preview">
        <Tabs.List>
          <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
            Student Preview
          </Tabs.Tab>
          <Tabs.Tab value="summary" leftSection={<IconListCheck size={14} />}>
            Detailed Summary
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="preview" pt="md">
          <ModuleListPanel
            allExpanded={true}
            isPreview={true}
            modules={courseModules}
            // TODO: update to adapt this to use the courseStructure data
            // instead of the imported moduleData
          />
        </Tabs.Panel>

        <Tabs.Panel value="summary" pt="md">
          <Card withBorder>
            <Stack gap="md">
              {courseModules.map(
                (module: CourseModule, moduleIndex: number) => (
                  <Box key={module.id}>
                    <Text fw={600} size="lg">
                      {moduleIndex + 1}. {module.title}
                    </Text>

                    {module.sections.map(
                      (section: ModuleSection, sectionIndex: number) => (
                        <Box key={section.id} ml="md" mt="sm">
                          <Text fw={500}>
                            {String.fromCharCode(65 + sectionIndex)}.{' '}
                            {section.title}
                          </Text>

                          <Stack gap="xs" mt="xs">
                            {section.items.map(
                              (item: ModuleItem, itemIndex: number) => (
                                <Group key={item.id} gap="xs">
                                  <Text size="sm">
                                    {itemIndex + 1}. {item.title}
                                  </Text>
                                  <Text size="xs" c="dimmed" tt="uppercase">
                                    ({item.type})
                                  </Text>
                                </Group>
                              ),
                            )}
                          </Stack>
                        </Box>
                      ),
                    )}
                  </Box>
                ),
              )}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Action Buttons */}
      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={onBack}>
          Back to Editing
        </Button>
        <Button onClick={onNext}>Confirm and Create Course</Button>
      </Group>
    </Container>
  )
}

export default ModuleReviewStep
