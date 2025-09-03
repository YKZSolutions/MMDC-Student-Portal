import {
  Alert,
  Badge,
  Box,
  Card,
  Container,
  Group,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core'
import { IconEye, IconInfoCircle, IconListCheck } from '@tabler/icons-react'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import {
  type Module,
  type ModuleItem,
  type ModuleSection,
} from '@/features/courses/modules/types.ts'

interface ReviewStepProps {
  module: Module
}

const ModuleReviewStep = ({ module }: ReviewStepProps) => {
  // Count total number of sections
  // By iterating over courseModules array and summing the length of sections
  // for each section
  const totalSections = module.sections.length

  // Count total number of subsections
  // By iterating over courseModules array and summing the length of items
  // for each subsection
  const totalSubsections = module.sections.reduce(
    (acc, section) => acc + section.subsections.length,
    0,
  )

  // Count total number of items
  // By iterating over courseModules array and iterating over sections for each
  // module. For each section, sum the length of items.
  const totalItems = module.sections.reduce(
    (acc, section) =>
      acc +
      section.subsections.reduce(
        (secAcc, section) => secAcc + section.items.length,
        0,
      ),
    0,
  )

  return (
    <Container h="100%" mb={'xl'}>
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
            {module.courseName}
          </Badge>
        </Group>

        <Group grow>
          <Stack align="center" gap={'xs'}>
            <Text size="xl" fw={700}>
              {totalSections}
            </Text>
            <Text c="dimmed">Sections</Text>
          </Stack>
          <Stack align="center" gap={'xs'}>
            <Text size="xl" fw={700}>
              {totalSubsections}
            </Text>
            <Text c="dimmed">Sub-Sections</Text>
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
        <Tabs.List grow>
          <Tabs.Tab value="preview" leftSection={<IconEye size={14} />}>
            Preview Student Module
          </Tabs.Tab>
          <Tabs.Tab value="summary" leftSection={<IconListCheck size={14} />}>
            Summary
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="preview" pt="md">
          <ModulePanel allExpanded={true} isPreview={true} module={module} />
        </Tabs.Panel>

        <Tabs.Panel value="summary" pt="md">
          <Card withBorder>
            <Stack gap="md">
              {module.sections.map((section: ModuleSection, index: number) => (
                <Box key={section.id}>
                  <Text fw={600} size="lg">
                    {index + 1}. {section.title}
                  </Text>

                  {section.subsections.map(
                    (subsection: ModuleSection, sectionIndex: number) => (
                      <Box key={subsection.id} ml="md" mt="sm">
                        <Text fw={500}>
                          {String.fromCharCode(65 + sectionIndex)}.{' '}
                          {subsection.title}
                        </Text>

                        <Stack gap="xs" mt="xs">
                          {subsection.items.map(
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
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}

export default ModuleReviewStep
