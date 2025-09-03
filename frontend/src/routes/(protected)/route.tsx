import { type Role } from '@/integrations/api/client'
import { client } from '@/integrations/api/client/client.gen'
import { supabase } from '@/integrations/supabase/supabase-client'
import Chatbot from '@/pages/shared/layout/chatbot'
import Sidebar from '@/pages/shared/layout/sidebar'
import Topbar from '@/pages/shared/layout/topbar'
import { Box, Burger, Group, Stack } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/(protected)')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session)
      throw redirect({ to: '/login', search: { redirect: location.href } })

    client.setConfig({
      headers: {
        Authorization: `Bearer ${data.session?.access_token}`,
      },
    })

    const authUser = {
      user: data.session.user,
      role: data.session.user.user_metadata.role as Role,
    }
    return { authUser }
  },
})

function RouteComponent() {
  const [isChatbotOpen, setChatbotOpen] = useState(false)
  const [isChatbotFabHidden, setChatbotFabHidden] = useState(true)
  const [sidebarOpened, setSidebarOpened] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <>
      <Group
        bg="background"
        gap={0}
        align="start"
        wrap="nowrap"
        style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
      >
        {isDesktop ? <Sidebar /> : sidebarOpened && <Sidebar />}
        <Box
          miw={sidebarOpened ? undefined : 0}
          maw={'100%'}
          className={'flex-1 h-full ' + (isDesktop ? 'p-4 pl-0' : '')}
        >
          <Stack
            className={
              'bg-white w-full h-full flex-1 shadow ' +
              (isDesktop ? 'rounded-lg p-5 pr-1 pb-0' : 'p-5')
            }
            justify="start"
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <Group justify="space-between" align="center" wrap='nowrap'>
              {!isDesktop && (
                <Burger
                  opened={sidebarOpened}
                  onClick={() => setSidebarOpened((o) => !o)}
                  size="sm"
                  aria-label="Toggle sidebar"
                />
              )}
              <Topbar
                setChatbotOpen={setChatbotOpen}
                setChatbotFabHidden={setChatbotFabHidden}
              />
            </Group>
            <Box
              style={{
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                overflowY: 'auto',
                scrollbarGutter: 'stable',
              }}
            >
              {/*Main Content*/}
              <Outlet />
            </Box>
          </Stack>
        </Box>
      </Group>
      <Chatbot
        isChatbotOpen={isChatbotOpen}
        setChatbotOpen={setChatbotOpen}
        isChatbotFabHidden={isChatbotFabHidden}
        setChatbotFabHidden={setChatbotFabHidden}
      />
    </>
  )
}
