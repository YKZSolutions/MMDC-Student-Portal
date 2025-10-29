import LabeledIcon from '@/components/labeled-icon'
import Editor from '@/features/lms/components/editor'
import { useSearchState } from '@/hooks/use-search-state'
import type { Block } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  rem,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconRubberStamp,
} from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'

const placeholderContent = [
  {
    id: 'initial-paragraph',
    type: 'paragraph',
    props: {
      backgroundColor: 'transparent',
      textAlignment: 'left',
      textColor: 'initial',
    },
    content: [],
    children: [],
  },
]

const route = getRouteApi(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/edit',
)

export default function LMSContentEditPage() {
  return (
    <Stack>
      <ActionBar />
      <ContentArea />
    </Stack>
  )
}

function ActionBar() {
  const { search, setSearch } = useSearchState(route)
  const navigate = route.useNavigate()

  const isPreview = search.view === 'preview'

  const toggleView = () => {
    setSearch({ view: isPreview ? undefined : 'preview' })
  }

  return (
    <Group justify="space-between">
      <Group>
        <LabeledIcon
          label="Go Back"
          onClick={() => navigate({ to: '/lms/$lmsCode/modules' })}
        >
          <IconArrowLeft />
        </LabeledIcon>
        <Text fw={600} size="lg">
          Module Content
        </Text>
        <Badge variant="outline">{isPreview ? 'Preview' : 'Edit'} Mode</Badge>
      </Group>

      <Group>
        <LabeledIcon
          label={isPreview ? 'Edit' : 'Preview'}
          onClick={() => toggleView()}
        >
          {isPreview ? <IconEdit /> : <IconEye />}
        </LabeledIcon>
        <LabeledIcon label="Save">
          <IconDeviceFloppy />
        </LabeledIcon>
        <LabeledIcon label="Publish">
          <IconRubberStamp />
        </LabeledIcon>
      </Group>
    </Group>
  )
}

function ContentArea() {
  const { search } = useSearchState(route)

  const editor = useCreateBlockNote({
    initialContent: placeholderContent as Block[],
  })

  return search.view === 'preview' ? (
    <Stack>
      <Text>Preview</Text>
    </Stack>
  ) : (
    <Stack gap={0}>
      <Stack gap="md" px={rem(48)} py={'lg'} pb={'xl'}>
        <Group align="start" gap="sm" justify="space-between">
          <Box>
            <TextInput
              // key={existingContent?.id}
              // onBlur={(e) => handleOnBlur(e)}
              placeholder="Title of the content"
              // defaultValue={existingContent?.title}
              variant="unstyled"
              width={'100%'}
              styles={{
                input: {
                  fontSize: '24px',
                  fontWeight: 600,
                  color: '#212529',
                  padding: 0,
                  border: 'none',
                  backgroundColor: 'transparent',
                  '&::placeholder': {
                    color: '#6c757d',
                  },
                },
              }}
              size="lg"
            />
            <Group gap="xs">
              {/* <Badge variant="light" color={isPublished ? 'green' : 'red'}>
                    {isPublished ? 'Published' : 'Draft'}
                  </Badge> */}
            </Group>
          </Box>
        </Group>
      </Stack>
      <Divider />
      <Editor editor={editor} />
    </Stack>
  )
}
