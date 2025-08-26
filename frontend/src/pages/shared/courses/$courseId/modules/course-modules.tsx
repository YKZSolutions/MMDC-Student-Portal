import {
  Group,
  Stack,
  Title,
  Button,
  Text,
  Accordion,
  useMantineTheme,
  ActionIcon,
  Menu,
  type AccordionControlProps,
  type GroupProps,
} from '@mantine/core'
import {
  IconBook,
  IconCircle,
  IconCircleCheck,
  IconDotsVertical,
  IconEdit,
  IconFile,
  IconFlag,
  IconLock,
  IconPencil,
  IconPlus,
  IconSettings,
  IconTrash,
  IconUrgent,
  IconViewportShort,
  IconViewportTall,
  IconWriting,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import SubmitButton from '@/components/submit-button.tsx'
import RoleComponentManager from '@/components/role-component-manager.tsx'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ButtonWithModal from '@/components/btn-w-modal.tsx'
import CourseCreationProcessModal from '@/features/courses/course-editor/course-creation-process-modal.tsx'
import type {
  Assignment,
  AssignmentType,
  StudentAssignment,
  SubmissionStatus,
} from '@/features/courses/assignments/types.ts'
import { getSubmissionStatus } from '@/utils/helpers.ts'
import { mockAssignmentsData } from '@/pages/shared/courses/$courseId/assignments/course-assignments.tsx'
import type { ContentType } from '@/features/courses/types.ts'
import {
  ModuleItemIcon,
  CompletedStatusIcon,
} from '@/components/icon-selector.tsx'
import CourseMainLayout from '@/features/courses/course-main-layout.tsx'
import { formatTimestampToDateTimeText } from '@/utils/formatters.ts'
import CourseModulePanel from '@/features/courses/modules/course-module-panel.tsx'

const CourseModules = () => {
  const { authUser } = useAuth('protected')
  const [allExpanded, setAllExpanded] = useState(false)

  const toggleExpandAll = () => {
    setAllExpanded((prev) => !prev)
  }

  return (
    <CourseMainLayout
      title={'Modules'}
      headerRightSection={
        <Group align="center">
          <Button
            onClick={toggleExpandAll}
            w={135}
            variant={'default'}
            leftSection={
              allExpanded ? (
                <IconViewportShort size={16} />
              ) : (
                <IconViewportTall size={16} />
              )
            }
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          {authUser.role === 'admin' && (
            <ButtonWithModal
              label={'Add New Content'}
              icon={<IconPlus />}
              modalComponent={CourseCreationProcessModal}
            />
          )}
        </Group>
      }
    >
      <Stack>
        <CourseModulePanel allExpanded={allExpanded} />
      </Stack>
    </CourseMainLayout>
  )
}

export default CourseModules
