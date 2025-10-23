import {
    Badge,
    Button,
    Divider,
    Flex,
    Group,
    Popover,
    rem,
    Stack,
    Text,
    Title,
    UnstyledButton,
    type MantineColor,
} from '@mantine/core'
import { IconFilter2, IconX, type ReactNode } from '@tabler/icons-react'
import { Children, isValidElement, useMemo } from 'react'

export type FilterOption<TOption> = {
  /** Display label for the filter option */
  label: string
  /** Value associated with the filter option */
  value: TOption | null | undefined
  /** Icon to display alongside the label */
  icon: ReactNode | null
  /** Color theme for the filter option */
  color: MantineColor
}

export interface FilterSectionProps<TOption> {
  /** Title of the filter section */
  label: string
  /** Available filter options */
  options: FilterOption<TOption>[]
  /** Currently selected filter value */
  matchedSearch: TOption | null | undefined
  /** Handler when a filter option is selected */
  handleSelectFilter: (value: TOption | null | undefined) => void
}

export interface FilterProps {
  /** Title of the filter section */
  title?: string | null
  /** Whether the filter should be expanded by default
   * @default false
   */
  shouldExpand?: boolean
  /** Handler to reset all filters */
  handleResetFilter: () => void
  /** Filter categories as children */
  children:
    | ReturnType<typeof FilterCategory>[]
    | ReturnType<typeof FilterCategory>
}

function Filter({
  title,
  handleResetFilter,
  shouldExpand = false,
  children,
}: FilterProps) {
  const activeFilters = useMemo(() => {
    const filters: Array<{
      label: string
      value: any
      onRemove: () => void
    }> = []

    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const props = child.props as FilterSectionProps<unknown>

        // Check if this child has the FilterCategory props structure
        if (
          props.label &&
          props.options &&
          typeof props.handleSelectFilter === 'function' &&
          'matchedSearch' in props
        ) {
          const { label, matchedSearch, options, handleSelectFilter } = props

          if (matchedSearch !== null && matchedSearch !== undefined) {
            const matchedOption = options.find(
              (opt) => opt.value === matchedSearch,
            )
            if (matchedOption) {
              filters.push({
                label: `${label}: ${matchedOption.label}`,
                value: matchedSearch,
                onRemove: () => handleSelectFilter(null),
              })
            }
          }
        }
      }
    })

    return filters
  }, [children, shouldExpand])

  return (
    <Group gap={rem(5)} wrap="nowrap">
      {/* Active Filter Badges - Auto-generated from children */}
      {activeFilters.length > 0 && shouldExpand && (
        <Group gap="xs" visibleFrom="sm">
          {activeFilters.map((filter, index) => (
            <Button
              key={`${filter.label}-${index}`}
              radius="md"
              variant="default"
              color="gray"
              fw={500}
              rightSection={<IconX size={16} />}
              onClick={filter.onRemove}
              fz={'sm'}
            >
              {filter.label}
            </Button>
          ))}
        </Group>
      )}

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
            {activeFilters.length > 0 && (
              <Badge
                size="sm"
                circle
                variant="filled"
                color="primary"
                ml="xs"
                styles={{
                  root: {
                    minWidth: rem(20),
                    minHeight: rem(20),
                    padding: 0,
                  },
                }}
              >
                {activeFilters.length}
              </Badge>
            )}
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
    </Group>
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
            onClick={() =>
              handleSelectFilter(
                matchedSearch == option?.value ? null : option?.value,
              )
            }
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
