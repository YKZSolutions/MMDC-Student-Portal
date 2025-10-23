import {
    Button,
    Flex,
    Popover,
    rem,
    Stack,
    Text,
    Title,
    UnstyledButton,
    type MantineColor,
} from '@mantine/core'
import { IconFilter2, type ReactNode } from '@tabler/icons-react'

export type FilterOption<TValue> = {
  label: string
  value: TValue | null | undefined
  icon: ReactNode | null
  color: MantineColor
}

export interface FilterSection<TOption> {
  label: string
  options: FilterOption<TOption>[]
  matchedSearch: FilterOption<TOption>['value']
  handleSelectFilter: (value: TOption | null | undefined) => void
}

export interface FilterProps<TSections extends readonly FilterSection<any>[]> {
  title: string
  section: TSections
  handleResetFilter: () => void
}

function Filter<const TSections extends readonly FilterSection<any>[]>({
  title,
  section,
  handleResetFilter,
}: FilterProps<TSections>) {
  return (
    <Popover
      radius={'md'}
      shadow="xl"
      withArrow
      arrowSize={14}
      position="bottom"
      width={rem(300)}
    >
      <Popover.Target>
        <Button
          variant="default"
          radius={'md'}
          leftSection={<IconFilter2 color="gray" size={20} />}
          lts={rem(0.25)}
          w={{
            base: '100%',
            xs: 'auto',
          }}
        >
          Filters
        </Button>
      </Popover.Target>
      <Popover.Dropdown bg="var(--mantine-color-body)">
        <Stack>
          <Flex justify={'space-between'}>
            <Title fw={500} c={'dark.8'} order={4}>
              {title}
            </Title>

            <UnstyledButton
              styles={{
                root: {
                  textDecoration: 'underline',
                },
              }}
              c={'primary'}
              onClick={() => handleResetFilter()}
            >
              Reset Filter
            </UnstyledButton>
          </Flex>

          {section.map((section, index) => (
            <Stack gap={'xs'} key={index}>
              <Text fw={500} c={'gray.7'} fz={'sm'}>
                {section.label}
              </Text>
              <Flex
                justify={'space-between'}
                w={'100%'}
                wrap={'wrap'}
                gap={'sm'}
              >
                {section.options.map((option) => (
                  <Button
                    className="flex-[47%]"
                    key={option.label}
                    variant={
                      section.matchedSearch === option.value
                        ? 'filled'
                        : 'outline'
                    }
                    styles={{
                      root: {
                        background:
                          section.matchedSearch === option.value
                            ? 'var(--mantine-color-gray-3)'
                            : 'transparent',
                        borderColor: 'var(--mantine-color-gray-3)',
                        color: 'var(--mantine-color-dark-7)',
                      },
                    }}
                    radius={'xl'}
                    leftSection={option.icon}
                    onClick={() =>
                      section.handleSelectFilter(option?.value || null)
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </Flex>
            </Stack>
          ))}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

export default Filter
