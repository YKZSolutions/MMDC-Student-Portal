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
  value: TValue | null
  icon: ReactNode
  color: MantineColor
}

interface FilterProps<TOption, TMatchedSearch> {
  matchedSearch: TMatchedSearch
  options: FilterOption<TOption>[]
  handleResetFilter: () => void
  handleSelectFilter: (option: TOption | null) => void
}

function Filter<TOption, TMatchedSearch>({
  options,
  matchedSearch,
  handleResetFilter,
  handleSelectFilter,
}: FilterProps<TOption, TMatchedSearch>) {
  return (
    <Popover position="bottom" width={rem(300)}>
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
              Filter Users
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

          <Stack gap={'xs'}>
            <Text fw={500} c={'gray.7'} fz={'sm'}>
              Role
            </Text>
            <Flex justify={'space-between'} w={'100%'} wrap={'wrap'} gap={'sm'}>
              {options.map((option) => (
                <Button
                  className="flex-[47%]"
                  key={option.label}
                  variant={
                    matchedSearch === option.value ? 'filled' : 'outline'
                  }
                  styles={{
                    root: {
                      background:
                        matchedSearch === option.value
                          ? 'var(--mantine-color-gray-3)'
                          : 'transparent',
                      borderColor: 'var(--mantine-color-gray-3)',
                      color: 'var(--mantine-color-dark-7)',
                    },
                  }}
                  radius={'xl'}
                  leftSection={option.icon}
                  onClick={() => handleSelectFilter(option?.value || null)}
                >
                  {option.label}
                </Button>
              ))}
            </Flex>
          </Stack>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

export default Filter
