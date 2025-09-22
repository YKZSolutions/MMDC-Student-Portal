import { useAuth } from '@/features/auth/auth.hook'
import type { AdminModule } from '@/features/courses/modules/admin/types.ts'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import {
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerCreateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { Box, Button, Group, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/modules/')

const { queryClient } = getContext()

interface ModulesAdminPageProps {
  module: AdminModule
  onAddContent: () => void
  onExpandAll: () => void
  allExpanded: boolean
}

function ModulesAdminPage() {
  const { authUser } = useAuth('protected')
  const navigate = route.useNavigate()
  const [allExpanded, setAllExpanded] = useState(false)

  const toggleExpandAll = () => setAllExpanded((prev) => !prev)

  const { lmsCode } = route.useParams()

  const { mutateAsync: createSection } = useAppMutation(
    lmsSectionControllerCreateMutation,
    {
      loading: {
        title: 'Creating Section',
        message: 'Creating new section',
      },
      success: {
        title: 'Created Section',
        message: 'Successfully created section',
      },
      error: {
        title: 'Failed to Create Section',
        message: 'There was an error creating the section',
      },
    },
    {
      // Clears the module tree cache to refetch the updated data
      onSuccess: async () => {
        const moduleTreeKey = lmsControllerFindModuleTreeQueryKey({
          path: { id: lmsCode },
        })

        // cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: moduleTreeKey })

        await queryClient.invalidateQueries({ queryKey: moduleTreeKey })
      },
    },
  )

  const handleAddContent = async () => {
    await createSection({
      path: {
        moduleId: lmsCode,
      },
      body: {
        title: 'New Section',
      },
    })
  }

  return (
    <Box>
      {/* Admin Actions Header */}

      <Group align={'center'} mb="lg" justify="space-between">
        <Title c="dark.7" variant="hero" order={2} fw={700}>
          Modules
        </Title>
        <Group justify="end">
          <Button radius={'md'} onClick={toggleExpandAll} variant="default">
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button
            radius={'md'}
            leftSection={<IconPlus />}
            onClick={handleAddContent}
          >
            Add New Content
          </Button>
        </Group>
      </Group>

      {/* Module Content with admin actions */}
      <ModulePanel viewMode="admin" allExpanded={allExpanded} />
    </Box>
  )
}

export default ModulesAdminPage
