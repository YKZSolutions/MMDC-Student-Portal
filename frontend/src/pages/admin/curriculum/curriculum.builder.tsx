// import { IconSelector } from '@/components/icon-selector'
import {
  ActionIcon,
  Button,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/curriculum/$curriculumCode_/edit')

export default function CurriculumBuilder() {
  const navigate = route.useNavigate()

  return (
    <Container size={'sm'} w={'100%'} pb={'xl'}>
      <Group mb="lg" justify="space-between">
        <Group align="start">
          <ActionIcon
            variant="subtle"
            radius="lg"
            mt={4}
            onClick={() =>
              navigate({
                to: '/curriculum',
              })
            }
          >
            <IconArrowLeft />
          </ActionIcon>
          <Stack gap={0}>
            <Title c={'dark.7'} variant="hero" order={2} fw={700}>
              Curriculum Builder
            </Title>
            <Text c={'dark.3'} fw={500}>
              Create a new curriculum for a program and major
            </Text>
          </Stack>
        </Group>

        <Group>
          <Button leftSection={<IconDeviceFloppy size={20} />}>Save</Button>
        </Group>
      </Group>
    </Container>
  )
}
