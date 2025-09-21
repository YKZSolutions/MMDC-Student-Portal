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
import { Suspense, useMemo, useState, type ReactNode } from 'react'

function AsyncTermComboboxQueryProvider({
  setSelected,
  children,
}: {
  setSelected: (term: EnrollmentPeriodDto | null) => void
  children: (props: { enrollmentPeriods: EnrollmentPeriodDto[] }) => ReactNode
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

  const _ = useMemo(() => {
    setSelected(activeEnrollmentPeriod)
  }, [data])

  return children({
    enrollmentPeriods,
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
      <Combobox.Target>
        {selected ? (
          <InputBase
            w={{
              base: '100%',
              xs: rem(250),
            }}
            radius={'md'}
            component="button"
            type="button"
            pointer
            onClick={() => combobox.toggleDropdown()}
            rightSection={<Combobox.Chevron />}
          >
            <Group gap={rem(5)} c={'dark.5'}>
              <Text size="sm">
                {formatToSchoolYear(selected.startYear, selected.endYear)},
              </Text>
              <Text size="sm" className="capitalize">
                Term {selected.term}, {selected.status}
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
                <AsyncTermComboboxQueryProvider setSelected={setSelected}>
                  {(props) => null}
                </AsyncTermComboboxQueryProvider>
              </Suspense>
            }
          />
        )}
      </Combobox.Target>

      <Combobox.Dropdown className="max-h-56 overflow-y-auto">
        <Combobox.Options>
          <Suspense
            fallback={
              <Group align="center" justify="center" p={'xl'}>
                <Loader size={18} />
              </Group>
            }
          >
            <AsyncTermComboboxQueryProvider setSelected={setSelected}>
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
