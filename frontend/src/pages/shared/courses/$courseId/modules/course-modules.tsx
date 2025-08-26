import { Button, Group } from '@mantine/core'
import {
  IconPlus,
  IconViewportShort,
  IconViewportTall,
} from '@tabler/icons-react'
import { useState } from 'react'
import { useAuth } from '@/features/auth/auth.hook.ts'
import ButtonWithModal from '@/components/btn-w-modal.tsx'
import CourseCreationProcessModal from '@/features/courses/course-editor/course-creation-process-modal.tsx'
import CourseMainLayout from '@/features/courses/course-main-layout.tsx'
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
      <CourseModulePanel allExpanded={allExpanded} />
    </CourseMainLayout>
  )
}

export default CourseModules
