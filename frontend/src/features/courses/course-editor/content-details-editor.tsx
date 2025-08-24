import {
  ActionIcon,
  type BoxProps,
  Stack,
  Textarea,
  useMantineTheme,
} from '@mantine/core'
import FormRow from '@/components/form-row.tsx'
import {
  IconCategory,
  IconChevronsRight,
} from '@tabler/icons-react'
import type { ComponentPropsWithoutRef } from 'react';

type ContentDetailsEditorProps = {
  opened: boolean;
  onClose: () => void;
  type: string;
  data: any;
} & ComponentPropsWithoutRef<typeof Stack>
  & BoxProps

// Originally Used as a Right Pane details editor
// TODO: Add expanded state, and render according to type
const ContentDetailsEditor = ({opened, onClose, type, data, ...stackProps}: ContentDetailsEditorProps) => {
  const theme = useMantineTheme();
  return (
    <Stack pos="relative" {...stackProps}>
        <ActionIcon
            onClick={onClose}
            variant="transparent"
            size="lg"
            color="gray"
            style={{ position: 'absolute', top: theme.spacing.xs, left: theme.spacing.xs }}
        >
            <IconChevronsRight size={32} />
        </ActionIcon>

        <Textarea
            size='2rem'
            inputSize='1rem'
            fw={700} mt={'sm'}
            placeholder="Enter Title"
            variant={'unstyled'}
            autosize
            minRows={1}
            maxRows={2}
        />
        {/*TODO: add actual content types, these are just placeholders*/}
        <Stack gap={'sm'}>
            <FormRow label="Category" />
            <FormRow label="Title" icon={<IconCategory />} />
            <FormRow label="Description" placeholder="Enter description" />
            <FormRow label="Tags" />
        </Stack>
    </Stack>
  )
}

export default ContentDetailsEditor