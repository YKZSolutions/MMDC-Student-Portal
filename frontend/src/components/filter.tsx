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

export type FilterOption<TValue = string> = {
  label: string
  value: TValue | null
  icon: ReactNode | null
  color: MantineColor
}

interface FilterProps<TOption, TMatchedSearch> {
  title: string
  section: FilterSection<TOption, TMatchedSearch>[]
  handleResetFilter: () => void
}

interface FilterSection<TOption, TMatchedSearch> {
  label: string
  options: FilterOption<TOption>[]
  matchedSearch: TMatchedSearch
  handleSelectFilter: (option: TOption | null) => void
}

function Filter<TOption extends string, TMatchedSearch>({
  title,
  section,
  handleResetFilter,
}: FilterProps<TOption, TMatchedSearch>) {
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
                    key={option.value}
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
