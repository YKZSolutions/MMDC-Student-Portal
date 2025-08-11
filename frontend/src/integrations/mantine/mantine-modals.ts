import EwalletModal from '@/features/modals/ewallet-modal'
import PutUserModal from '@/features/modals/put-user.admin'

export const modals = {
  ewallet: EwalletModal,
  putUser: PutUserModal,
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof modals
  }
}
