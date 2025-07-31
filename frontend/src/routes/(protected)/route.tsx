import { type Role } from '@/integrations/api/client'
import { client } from '@/integrations/api/client/client.gen'
import { supabase } from '@/integrations/supabase/supabase-client'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)')({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const user = await supabase.auth.getUser()

    if (user.error)
      throw redirect({ to: '/login', search: { redirect: location.href } })

    const session = await supabase.auth.getSession()

    client.setConfig({
      headers: {
        Authorization: `Bearer ${session.data.session?.access_token}`,
      },
    })

    const authUser = {
      user: user.data.user,
      role: user.data.user.user_metadata.role as Role,
    }
    return { authUser }
  },
})

function RouteComponent() {
  const { authUser } = Route.useRouteContext()

  return (
    <div>
      Hello "/(protected)/layout" {authUser.user.email} {authUser.role}
      <Outlet />
    </div>
  )
}
