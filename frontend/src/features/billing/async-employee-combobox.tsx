import SupabaseAvatar from '@/components/supabase-avatar'
import type {
    PaginationMetaDto,
    UserWithRelations,
} from '@/integrations/api/client'
import { usersControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import {
    ActionIcon,
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
import type { UseFormReturnType } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import { IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'
import type { IUsersQuery } from '../user-management/types'
import type { CreateBillFormValues } from '../validation/create-billing'

function AsyncEmployeeComboboxQueryProvider({
  children,
  props = {
    search: '',
    page: 1,
    role: null,
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
      query: { search, page, ...(role && { role }) },
    }),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const users = data?.users ?? []
  const meta = data?.meta

  console.log(users)

  return children({
    users,
    meta,
    isFetching,
  })
}

function AsyncEmployeeCombobox({
  form,
}: {
  form: UseFormReturnType<CreateBillFormValues>
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
  const [selectedUser, setSelectedUser] = useState<UserWithRelations>(
    {} as UserWithRelations,
  )

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
    form.setFieldValue('userId', parsedUserData.id)
    form.setFieldValue(
      'bill.payerName',
      `${parsedUserData.firstName} ${parsedUserData.lastName}`,
    )
    form.setFieldValue(
      'bill.payerEmail',
      parsedUserData.userAccount?.email || 'N/A',
    )

    combobox.closeDropdown()
  }

  const handleResetValues = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation() // prevent combobox opening when clearing

    // Unset in local state
    setSelectedUser({} as UserWithRelations)

    // Unset in form
    form.resetField('userId')
    form.resetField('bill.payerName')
    form.resetField('bill.payerEmail')
  }

  return (
    <Combobox
      onOptionSubmit={(optionValue) => handleOptionSubmit(optionValue)}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        {selectedUser.id ? (
          <InputBase
            label="User"
            component="button"
            type="button"
            pointer
            withAsterisk
            key={form.key('userId')}
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
            label="User"
            placeholder="Search a user"
            withAsterisk
            key={form.key('userId')}
            {...form.getInputProps('userId')}
            onChange={(event) => handleSearch(event)}
            onClick={() => combobox.openDropdown()}
            onBlur={() => combobox.closeDropdown()}
            rightSection={
              <Suspense fallback={<Loader size={18} />}>
                <AsyncEmployeeComboboxQueryProvider>
                  {(props) => null}
                </AsyncEmployeeComboboxQueryProvider>
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
            <AsyncEmployeeComboboxQueryProvider props={debouncedQuery}>
              {(props) =>
                props.users.map((user) => (
                  <Combobox.Option value={JSON.stringify(user)} key={user.id}>
                    <UserComboboxCard user={user} />
                  </Combobox.Option>
                ))
              }
            </AsyncEmployeeComboboxQueryProvider>
          </Suspense>
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

function UserComboboxCard({ user }: { user: UserWithRelations }) {
  return (
    <Group gap={'sm'} align={'center'} py={rem(5)}>
      <SupabaseAvatar
        bucket={SupabaseBuckets.USER_AVATARS}
        path={user.id}
        imageType="jpg"
        name={`${user.firstName} ${user.lastName}`}
      />
      <Box>
        <Text fw={600}>
          {user.firstName} {user.lastName}
        </Text>
        <Text fz={'sm'} fw={500} c={'dark.2'}>
          {user.userAccount?.email}
        </Text>
      </Box>
    </Group>
  )
}

export default AsyncEmployeeCombobox
