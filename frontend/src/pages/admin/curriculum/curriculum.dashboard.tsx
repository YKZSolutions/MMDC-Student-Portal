import { curriculumControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
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
  IconBox,
  IconChartAreaLineFilled,
  IconCode,
  IconPlus,
  IconSearch,
  IconShieldFilled,
  type ReactNode,
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/curriculum/')

export default function CurriculumDashboard() {
  const { data: curriculums } = useSuspenseQuery(
    curriculumControllerFindAllOptions(),
  )

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
          <Link to="/curriculum/create">
            <Button leftSection={<IconPlus />}>Create Curriculum</Button>
          </Link>
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
          {curriculums.map((curriculum) => (
            <CurriculumCard
              key={curriculum.id}
              id={curriculum.id}
              code={`${curriculum.program.programCode}-${curriculum.major.majorCode}`}
              program={curriculum.program.name}
              major={curriculum.major.name}
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
            {props.icon !== '' ? props.icon : <IconBox />}
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
            to="/curriculum/$curriculumCode/edit"
            params={{ curriculumCode: props.code }}
          >
            <Button size="xs" variant="outline" radius="lg" px="lg">
              Edit
            </Button>
          </Link>
          <Link
            to="/curriculum/$curriculumCode"
            params={{ curriculumCode: props.code }}
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
