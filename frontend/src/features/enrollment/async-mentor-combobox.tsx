import SupabaseAvatar from '@/components/supabase-avatar'
import type {
  DetailedCourseSectionDto,
  PaginationMetaDto,
  UserWithRelations,
} from '@/integrations/api/client'
import { usersControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import {
  ActionIcon,
  Box,
  Combobox,
  Flex,
  Group,
  InputBase,
  Loader,
  rem,
  Text,
  TextInput,
  useCombobox,
} from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import { IconUserOff, IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Fragment, Suspense, useState, type ReactNode } from 'react'
import type { IUsersQuery } from '../user-management/types'
import type { EditSectionFormValues } from '../validation/edit-course-offering-subject'

function AsyncMentorComboboxQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    role: 'mentor',
  },
}: {
  children: (props: {
    users: UserWithRelations[]
    meta: PaginationMetaDto | undefined
    isFetching: boolean
  }) => ReactNode
  props?: IUsersQuery
}) {
  const { search, page, role } = props

  const { data, isFetching } = useSuspenseQuery({
    ...usersControllerFindAllOptions({
      query: { search, page, role: 'mentor' },
    }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const users = data?.users ?? []
  const meta = data?.meta

  return children({
    users,
    meta,
    isFetching,
  })
}

function AsyncMentorCombobox({
  form,
  defaultSelectedUser,
}: {
  form: UseFormReturnType<EditSectionFormValues>
  defaultSelectedUser: DetailedCourseSectionDto['user']
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const queryDefaultValues = {
    search: '',
    page: 1,
    role: null,
  }

  const [query, setQuery] = useState<IUsersQuery>(queryDefaultValues)
  const [selectedUser, setSelectedUser] =
    useState<DetailedCourseSectionDto['user']>(defaultSelectedUser)

  // Debounced Query Value
  const [debouncedQuery] = useDebouncedValue(query, 250)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setQuery((prev) => ({
      ...prev,
      search: value,
    }))

    combobox.resetSelectedOption()
    combobox.openDropdown()
  }

  const handleOptionSubmit = (optionValue: string) => {
    const parsedUserData: UserWithRelations = JSON.parse(optionValue)

    // Set in local state
    setSelectedUser(parsedUserData)

    // Set in form
    form.setFieldValue('mentorId', parsedUserData.id)

    combobox.closeDropdown()
  }

  const handleResetValues = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation() // prevent combobox opening when clearing

    // Unset in local state
    setSelectedUser(null)

    // Set the value if unselected
    form.setFieldValue('mentorId', null)
  }

  return (
    <Combobox
      onOptionSubmit={(optionValue) => handleOptionSubmit(optionValue)}
      store={combobox}
    >
      <Combobox.Target>
        {selectedUser?.id ? (
          <InputBase
            radius={'md'}
            label="Mentor"
            component="button"
            type="button"
            pointer
            withAsterisk
            {...form.getInputProps('userId')}
            rightSection={
              <ActionIcon
                size="sm"
                variant="subtle"
                radius={'xl'}
                c={'dark'}
                onClick={(e) => handleResetValues(e)}
              >
                <IconX size={16} />
              </ActionIcon>
            }
            multiline
            onClick={() => combobox.openDropdown()}
          >
            <UserComboboxCard user={selectedUser} />
          </InputBase>
        ) : (
          <TextInput
            radius={'md'}
            label="Mentor"
            placeholder="Search a mentor"
            withAsterisk
            {...form.getInputProps('userId')}
            onChange={(event) => handleSearch(event)}
            onClick={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            rightSection={
              <Suspense fallback={<Loader size={18} />}>
                <AsyncMentorComboboxQueryProvider>
                  {(props) => null}
                </AsyncMentorComboboxQueryProvider>
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
            <AsyncMentorComboboxQueryProvider props={debouncedQuery}>
              {(props) => (
                <>
                  {props.users.length === 0 && (
                    <Flex
                      align="center"
                      justify="center"
                      direction="column"
                      py="md"
                      c="dark.2"
                    >
                      <IconUserOff size={28} stroke={1.5} />
                      <Text mt={6} size="sm">
                        No users found
                      </Text>
                      <Text size="xs" c="dimmed">
                        Try adjusting your search
                      </Text>
                    </Flex>
                  )}
                  {props.users.map((user) => (
                    <Fragment key={user.id}>
                      <Combobox.Option
                        value={JSON.stringify(user)}
                        key={user.id}
                      >
                        <UserComboboxCard user={user} />
                      </Combobox.Option>
                    </Fragment>
                  ))}
                </>
              )}
            </AsyncMentorComboboxQueryProvider>
          </Suspense>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

function UserComboboxCard({
  user,
}: {
  user: DetailedCourseSectionDto['user']
}) {
  if (!user) return null

  return (
    <Group gap={'sm'} align={'center'} py={0}>
      <SupabaseAvatar
        size={rem(22)}
        bucket={SupabaseBuckets.USER_AVATARS}
        path={user.id}
        imageType="jpg"
        name={`${user.firstName} ${user.lastName}`}
      />
      <Box>
        <Text size="sm" fw={500} c={'dark.5'}>
          {user.firstName} {user.lastName}
        </Text>
      </Box>
    </Group>
  )
}

export default AsyncMentorCombobox
