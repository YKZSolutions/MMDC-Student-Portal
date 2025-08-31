import {
  Box,
  Button,
  Card,
  Container,
  Group,
  rem,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core'
import {
  IconChartAreaLineFilled,
  IconCode,
  IconPlus,
  IconSearch,
  IconShieldFilled,
  type ReactNode,
} from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export default function CurriculumDashboard() {
  const mockData = [
    {
      id: '1',
      code: 'BSIT-SD',
      program: 'BS Information Technology',
      major: 'Software Development',
      icon: <IconCode />,
    },
    {
      id: '2',
      code: 'BSIT-DA',
      program: 'BS Information Technology',
      major: 'Data Analytics',
      icon: <IconChartAreaLineFilled />,
    },
    {
      id: '3',
      code: 'BSIT-NC',
      program: 'BS Information Technology',
      major: 'Networking & Cybersecurity',
      icon: <IconShieldFilled />,
    },
  ]

  return (
    <Container fluid m={0}>
      <Box pb={'xl'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Curriculum Management
        </Title>
        <Text c="dimmed" fw={500}>
          Manage programs, majors, and courses
        </Text>
      </Box>

      <Stack>
        <Group justify="end">
          <TextInput
            placeholder="Search name/email"
            radius="md"
            leftSection={<IconSearch size={18} stroke={1} />}
            w={rem(250)}
          />
          <Button leftSection={<IconPlus />}>Create Curriculum</Button>
        </Group>

        <SimpleGrid
          cols={{
            base: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
          }}
        >
          {mockData.map((curriculum) => (
            <CurriculumCard
              key={curriculum.id}
              id={curriculum.id}
              code={curriculum.code}
              program={curriculum.program}
              major={curriculum.major}
              icon={curriculum.icon}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}

interface CurriculumCardProps {
  id: string
  code: string
  program: string
  major: string
  icon: ReactNode
}

function CurriculumCard(props: CurriculumCardProps) {
  return (
    <Card p="lg" shadow="sm" h={140} radius="md" withBorder>
      <Stack gap={0} h="100%" justify="space-between">
        <Group wrap="nowrap" w="100%">
          <ThemeIcon variant="transparent" radius="lg">
            {props.icon}
          </ThemeIcon>

          <Stack gap={0} flex={1} className="overflow-hidden">
            <Text fw={500} size="lg" className="truncate" c="primary">
              {props.major}
            </Text>
            <Text size="sm" c="dimmed" className="truncate">
              {props.program}
            </Text>
          </Stack>
        </Group>

        <Group justify="end" gap="xs">
          <Link
            to="/curriculum/$curriculumId/edit"
            params={{ curriculumId: props.code }}
          >
            <Button size="xs" variant="outline" radius="lg" px="lg">
              Edit
            </Button>
          </Link>
          <Link
            to="/curriculum/$curriculumId"
            params={{ curriculumId: props.code }}
          >
            <Button size="xs" radius="lg" px="lg">
              View
            </Button>
          </Link>
        </Group>
      </Stack>
    </Card>
  )
}
