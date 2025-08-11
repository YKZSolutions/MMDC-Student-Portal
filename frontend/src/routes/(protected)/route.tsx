import { type Role } from '@/integrations/api/client'
import { client } from '@/integrations/api/client/client.gen'
import { supabase } from '@/integrations/supabase/supabase-client'
import Sidebar from '@/pages/shared/layout/sidebar'
import Topbar from '@/pages/shared/layout/topbar'
import { Group, Stack } from '@mantine/core'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import Chatbot from '@/pages/shared/layout/chatbot'
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
  const [isChatbotFabHidden, setChatbotFabHidden] = useState(false)

  return (
    <>
      <Group
        bg="background"
        gap={0}
        align="start"
        style={{ position: 'relative' }}
      >
        <Sidebar />
        <Stack className="flex-1 min-h-screen p-4 pl-0">
          <Stack
            className="bg-white w-full flex-1 rounded-lg shadow p-5"
            justify="start"
            style={{ position: 'relative' }}
          >
            <Topbar
              setChatbotOpen={setChatbotOpen}
              setChatbotFabHidden={setChatbotFabHidden}
            />
            <Outlet />
          </Stack>
        </Stack>
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
