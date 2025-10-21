import { AsyncSearchable } from '@/components/async-searchable'
import { AsyncSelectList } from '@/components/async-select-list'
import { type ProgramDto } from '@/integrations/api/client'
import { programControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { Card, Container, Stack, Text } from '@mantine/core'
import { useState } from 'react'

function StudentDashboard() {
  const [items, setItems] = useState<ProgramDto[]>([])

  return (
    <Container>
      <Card>Woggy</Card>
      {/* Sample AsyncSearchable */}
      {/* <AsyncSearchable
        getOptions={(search) =>
          programControllerFindAllOptions({ query: { search } })
        }
        mapData={(data) => data.programs}
        getValue={(data) => data.id}
        getLabel={(data) => data.name}
        withAsterisk
        // renderValue={(item) => <Card>{item?.name}</Card>}
        renderOption={(item) => (
          <Stack gap={0}>
            <Text size="sm">{item.name}</Text>
            <Text size="xs" c="dimmed">
              {item.programCode}
            </Text>
          </Stack>
        )}
        selectFirstOption={true}
      /> */}
      <AsyncSelectList
        getOptions={(search) =>
          programControllerFindAllOptions({ query: { search } })
        }
        mapData={(data) => data.programs}
        getValue={(data) => data.id}
        getLabel={(data) => data.name}
        items={items}
        onAdd={(item) => {
          setItems((prev) => [...prev, item])
        }}
        renderItem={(item) => <Text>{item.name}</Text>}
        renderOption={(item) => (
          <Stack gap={0}>
            <Text size="sm">{item.name}</Text>
            <Text size="xs" c="dimmed">
              {item.programCode}
            </Text>
          </Stack>
        )}
      />
    </Container>
  )
}

export default StudentDashboard
