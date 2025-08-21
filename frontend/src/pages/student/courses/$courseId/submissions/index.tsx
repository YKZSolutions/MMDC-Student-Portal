import { Button, Group, Stack, Tabs, Title } from '@mantine/core'
import { IconHistory, IconSend } from '@tabler/icons-react'

const SubmissionsPageStudentView = () => {
  return (
    <Stack>
      <Group justify="space-between" align="start">
        <Title>Submissions</Title>
      </Group>
      <Stack>
        <Tabs defaultValue={'upcoming'}>
          <Tabs.List>
            <Tabs.Tab value="upcoming" leftSection={<IconSend size={12} />}>
              Upcoming Submissions
            </Tabs.Tab>
            <Tabs.Tab value="past" leftSection={<IconHistory size={12} />}>
              Past Submissions
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="gallery">
            Gallery tab content
          </Tabs.Panel>

          <Tabs.Panel value="messages">
            Messages tab content
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            Settings tab content
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Stack>
  )
}

export default SubmissionsPageStudentView
