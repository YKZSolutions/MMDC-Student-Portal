import {
    ActionIcon,
    Button,
    Container,
    Divider,
    Flex,
    Group,
    rem,
    Stack,
    Title,
} from '@mantine/core'
import { IconArrowLeft, IconPlus, IconUpload } from '@tabler/icons-react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'

const route = getRouteApi('/(protected)/enrollment/$periodId')

function EnrollmentPeriodIdPage() {
  const navigate = useNavigate()
  const { periodId } = route.useParams()

  return (
    <Container fluid m={0} pb={'lg'}>
      <Flex align={'center'} pb={'lg'}>
        <Group>
          <ActionIcon
            radius={'xl'}
            variant="subtle"
            size={'lg'}
            onClick={() =>
              navigate({
                to: '..',
              })
            }
          >
            <IconArrowLeft />
          </ActionIcon>
          <Title c={'dark.7'} order={3} fw={700}>
            2023 - 2024
          </Title>
          <Divider orientation="vertical" />
          <Title c={'dark.7'} order={3} fw={700}>
            Term 2
          </Title>
        </Group>
        <Group align={'center'} gap={'sm'} ml={'auto'}>
          <Button
            variant="outline"
            radius={'md'}
            leftSection={<IconUpload size={20} />}
            c={'gray.7'}
            color="gray.4"
            lts={rem(0.25)}
            // onClick={() => mutateIntent()}
          >
            Export
          </Button>
          <Button
            variant="filled"
            radius={'md'}
            leftSection={<IconPlus size={20} />}
            lts={rem(0.25)}
          >
            Pay Bill
          </Button>

          {/* <Button
            variant="outline"
            radius={'md'}
            leftSection={<IconUpload size={20} />}
            c={'gray.7'}
            color="gray.4"
            lts={rem(0.25)}
            onClick={() => mutateAttach(dataIntent)}
          >
            Attach
          </Button> */}
        </Group>
      </Flex>

      <Stack>
        {/* <BillingPrefaceDetails />
        <BillingFeeBreakdown open={open} /> */}
      </Stack>
    </Container>
  )
}

export default EnrollmentPeriodIdPage
