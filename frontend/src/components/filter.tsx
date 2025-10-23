import {
    Button,
    Divider,
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

export type FilterOption<TOption> = {
  label: string
  value: TOption | null | undefined
  icon: ReactNode | null
  color: MantineColor
}

export interface FilterSectionProps<TOption> {
  label: string
  options: FilterOption<TOption>[]
  matchedSearch: TOption | null | undefined
  handleSelectFilter: (value: TOption | null | undefined) => void
}

export interface FilterProps {
  title?: string | null
  handleResetFilter: () => void
  children: ReactNode
}

function Filter({ title, handleResetFilter, children }: FilterProps) {
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
            {title && (
              <Title fw={500} c={'dark.8'} order={4}>
                {title}
              </Title>
            )}

            <UnstyledButton
              styles={{
                root: {
                  textDecoration: 'underline',
                },
              }}
              ml={'auto'}
              c={'primary'}
              onClick={() => handleResetFilter()}
            >
              Reset Filter
            </UnstyledButton>
          </Flex>
          {children}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

function FilterCategory<TOption>({
  label,
  options,
  matchedSearch,
  handleSelectFilter,
}: FilterSectionProps<TOption>) {
  return (
    <Stack gap={'xs'}>
      <Divider />
      <Text fw={500} c={'gray.7'} fz={'sm'}>
        {label}
      </Text>
      <Flex justify={'space-between'} w={'100%'} wrap={'wrap'} gap={'sm'}>
        {options.map((option) => (
          <Button
            className={'flex-[47%]'}
            key={option.label}
            variant={matchedSearch === option.value ? 'filled' : 'outline'}
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
  )
}

Filter.Category = FilterCategory

export default Filter
