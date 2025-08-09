import EwalletModal from "./ewallet-modal"

export const customModals = {
    ewallet: EwalletModal
}

declare module '@mantine/modals' {
  export interface MantineModalsOverride {
    modals: typeof customModals
  }
}
