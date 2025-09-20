import type { EnrollmentPeriodDto } from '@/integrations/api/client'
import {
  enrollmentControllerFindActiveEnrollmentOptions,
  enrollmentControllerFindAllEnrollmentsOptions,
  enrollmentControllerFindOneEnrollmentOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { formatToSchoolYear } from '@/utils/formatters'
import {
  Box,
  Combobox,
  Group,
  InputBase,
  Loader,
  rem,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core'
import {
  useSuspenseQuery,
  type UseSuspenseQueryOptions,
} from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { Suspense, useState, type ReactNode } from 'react'

function AsyncTermComboboxQueryProvider({
  children,
}: {
  children: (props: {
    enrollmentPeriods: EnrollmentPeriodDto[]
    activeEnrollmentPeriod: EnrollmentPeriodDto | null
  }) => ReactNode
}) {
  const searchParam: {
    term: EnrollmentPeriodDto['id']
  } = useSearch({ strict: false })

  // Fetch active enrollment period or selected term details if term is in search
  const options = searchParam.term
    ? enrollmentControllerFindOneEnrollmentOptions({
        path: { enrollmentId: searchParam.term },
      })
    : enrollmentControllerFindActiveEnrollmentOptions()

  const { data: activeEnrollmentPeriod } = useSuspenseQuery(
    options as UseSuspenseQueryOptions<EnrollmentPeriodDto>,
  )

  const { data } = useSuspenseQuery(
    enrollmentControllerFindAllEnrollmentsOptions({}),
  )

  const enrollmentPeriods = data.enrollments

  return children({
    enrollmentPeriods,
    activeEnrollmentPeriod,
  })
}

export default function AsyncTermCombobox() {
  const navigate = useNavigate()
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const [selected, setSelected] = useState<EnrollmentPeriodDto | null>(null)

  const handleSelect = (optionValue: string) => {
    const parsed: EnrollmentPeriodDto = JSON.parse(optionValue)
    setSelected(parsed)
    navigate({
      to: '.',
      search: (old) => ({
        ...old,
        term: parsed.id,
      }),
    })
    combobox.closeDropdown()
  }

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(v) => handleSelect(v)}
      withinPortal={false}
    >
      <Suspense
        fallback={
          <Box>
            <TermComboboxTarget
              activeEnrollmentPeriod={selected}
              combobox={combobox}
            />
          </Box>
        }
      >
        <AsyncTermComboboxQueryProvider>
          {({ activeEnrollmentPeriod }) => (
            <Combobox.Target>
              {/* Box makes it ref-able */}
              <Box>
                <TermComboboxTarget
                  activeEnrollmentPeriod={activeEnrollmentPeriod}
                  combobox={combobox}
                />
              </Box>
            </Combobox.Target>
          )}
        </AsyncTermComboboxQueryProvider>
      </Suspense>

      <Combobox.Dropdown className="max-h-56 overflow-y-auto">
        <Combobox.Options>
          <Suspense
            fallback={
              <Group align="center" justify="center" p={'xl'}>
                <Loader size={18} />
              </Group>
            }
          >
            <AsyncTermComboboxQueryProvider>
              {({ enrollmentPeriods }) =>
                enrollmentPeriods.map((period) => (
                  <Combobox.Option
                    value={JSON.stringify(period)}
                    key={period.id}
                  >
                    <Group align="center" gap={rem(8)}>
                      <Box>
                        <Text size="sm" fw={500} c={'dark.5'}>
                          {formatToSchoolYear(period.startYear, period.endYear)}
                        </Text>
                        <Text size="sm" c="dimmed" className="capitalize">
                          Term {period.term} • {period.status}
                        </Text>
                      </Box>
                    </Group>
                  </Combobox.Option>
                ))
              }
            </AsyncTermComboboxQueryProvider>
          </Suspense>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

function TermComboboxTarget({
  activeEnrollmentPeriod,
  combobox,
}: {
  activeEnrollmentPeriod: EnrollmentPeriodDto | null
  combobox: ReturnType<typeof useCombobox>
}) {
  return activeEnrollmentPeriod ? (
    <InputBase
      w={{ base: '100%', xs: rem(250) }}
      radius={'md'}
      component="button"
      type="button"
      pointer
      onClick={() => combobox.toggleDropdown()}
      rightSection={<Combobox.Chevron />}
    >
      <Group gap={rem(5)} c={'dark.5'}>
        <Text size="sm">
          {formatToSchoolYear(
            activeEnrollmentPeriod.startYear,
            activeEnrollmentPeriod.endYear,
          )}
          ,
        </Text>
        <Text size="sm" className="capitalize">
          Term {activeEnrollmentPeriod.term}, {activeEnrollmentPeriod.status}
        </Text>
      </Group>
    </InputBase>
  ) : (
    <TextInput
      miw={rem(250)}
      radius={'md'}
      placeholder="Filter by term"
      onClick={() => combobox.openDropdown()}
      onBlur={() => combobox.closeDropdown()}
      rightSection={
        <Suspense fallback={<Loader size={18} />}>
          <AsyncTermComboboxQueryProvider>
            {(props) => null}
          </AsyncTermComboboxQueryProvider>
        </Suspense>
      }
    />
  )
}
