import AddModuleDrawer from '@/features/courses/modules/admin/add-module-drawer'
import ModulePanel from '@/features/courses/modules/module-panel.tsx'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { Box, Button, Group, Title } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { getRouteApi } from '@tanstack/react-router'
import { Fragment, useState } from 'react'

const route = getRouteApi('/(protected)/lms/$lmsCode/modules/')

const { queryClient } = getContext()

function ModulesAdminPage() {
  const [allExpanded, setAllExpanded] = useState(false)

  return (
    <Box>
      <AddModuleDrawer>
        {({ setDrawer }) => (
          <Fragment>
            {/* Admin Actions Header */}
            <Group align={'center'} mb="lg" justify="space-between">
              <Title c="dark.7" variant="hero" order={2} fw={700}>
                Modules
              </Title>
              <Group justify="end">
                {/* <Button
                  radius={'md'}
                  onClick={toggleExpandAll}
                  variant="default"
                >
                  {allExpanded ? 'Collapse All' : 'Expand All'}
                </Button> */}
                <Button
                  radius={'md'}
                  leftSection={<IconPlus />}
                  onClick={() => setDrawer(true)}
                >
                  Add New Section
                </Button>
              </Group>
            </Group>

            {/* Module Content with admin actions */}
            <ModulePanel viewMode="admin" allExpanded={allExpanded} />
          </Fragment>
        )}
      </AddModuleDrawer>
    </Box>
  )
}

export default ModulesAdminPage
