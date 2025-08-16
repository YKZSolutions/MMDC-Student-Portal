import SupabaseAvatar from '@/components/supabase-avatar'
import type { IUsersQuery } from '@/features/user-management/types'
import type {
    PaginationMetaDto,
    UserWithRelations,
} from '@/integrations/api/client'
import { usersControllerFindAllOptions } from '@/integrations/api/client/@tanstack/react-query.gen'
import { SupabaseBuckets } from '@/integrations/supabase/supabase-bucket'
import {
    ActionIcon,
    Box,
    Button,
    Combobox,
    Container,
    Group,
    InputBase,
    Loader,
    rem,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    useCombobox,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm, type UseFormReturnType } from '@mantine/form'
import { useDebouncedValue } from '@mantine/hooks'
import {
    IconInfoCircle,
    IconSquareRoundedPlus,
    IconX
} from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense, useState, type ReactNode } from 'react'

function CreateBillingPage() {
  const form = useForm({
    initialValues: {
      user: {} as UserWithRelations,
    },
  })

  return (
    <Container size={'sm'} w={'100%'}>
      <Box pb={'lg'}>
        <Title c={'dark.7'} variant="hero" order={2} fw={700}>
          Create Bill
        </Title>
        <Text c={'dark.3'} fw={500}>
          Fill out the form below to create a new bill for a user.
        </Text>
      </Box>
      <Stack gap="xl">
        {/* User Select */}
        <AsyncEmployeeCombobox form={form} />

        {/* Location and Employment fields */}
        <Group grow gap="md">
          <DatePickerInput
            label="Pick date"
            placeholder="Pick date"
            // value={value}
            // onChange={setValue}
          />
          <Select
            label="Employment"
            placeholder="Pick one"
            data={[
              'Full time',
              'Part time',
              'Contract',
              'Internship',
              'Freelance',
            ]}
          />
        </Group>

        {/* Title field (second one) */}
        <TextInput label="Title" placeholder="What is your title?" />

        {/* Description field */}
        <Textarea
          label="Description"
          placeholder="e.g. I joined Stripe's Customer Success team to help them scale their checkout product. I focused mainly on onboarding new customers and resolving complaints."
          rightSection={<IconInfoCircle size={16} color="gray" />}
          autosize
          minRows={4}
        />
      </Stack>

      {/* Action buttons */}
      <Group mt="xl" justify="flex-end">
        <Button
          variant="default"
          style={{
            backgroundColor: '#25262B',
            color: '#C1C2C5',
            borderColor: '#2C2E33',
          }}
        >
          Save as draft
        </Button>
        <Button
          variant="filled"
          color="violet"
          leftSection={<IconSquareRoundedPlus size={18} />}
        >
          Add experience
        </Button>
      </Group>
    </Container>
  )
}

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
  form: UseFormReturnType<{ user: UserWithRelations }>
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

    form.setFieldValue('user', parsedUserData)

    combobox.closeDropdown()
  }

  const handleResetValues = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation() // prevent combobox opening when clearing
    form.setFieldValue('user', {} as UserWithRelations)
  }

  return (
    <Combobox
      onOptionSubmit={(optionValue) => handleOptionSubmit(optionValue)}
      withinPortal={false}
      store={combobox}
    >
      <Combobox.Target>
        {form.getValues().user.id ? (
          <InputBase
            label="User"
            component="button"
            type="button"
            pointer
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
            <UserComboboxCard user={form.getValues().user} />
          </InputBase>
        ) : (
          <TextInput
            label="User"
            placeholder="Search a user"
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

export default CreateBillingPage
