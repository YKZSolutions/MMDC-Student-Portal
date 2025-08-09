import PutUserModal from '@/pages/admin/modals/put-user.admin'

export const modals = {
  putUser: PutUserModal,
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: keyof typeof modals
  }
}
