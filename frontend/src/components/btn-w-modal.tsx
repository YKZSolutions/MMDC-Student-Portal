import { useDisclosure } from '@mantine/hooks'
import { type BoxProps, Button } from '@mantine/core'
import React, { type ComponentPropsWithoutRef, type JSX } from 'react'
import type { CustomModalProp } from '@/components/types.ts'

type ButtonWithModalProps = {
  label?: string | JSX.Element
  icon?: JSX.Element
  modalComponent: React.ComponentType<CustomModalProp>
  fullOnMobile?: boolean
} & Omit<ComponentPropsWithoutRef<typeof Button>, 'onClick' | 'leftSection'> &
  BoxProps

const ButtonWithModal = ({
  label,
  icon,
  modalComponent: ModalComponent,
  fullOnMobile = true,
  ...buttonProps
}: ButtonWithModalProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Button
        bg={'secondary'}
        leftSection={icon}
        onClick={open}
        {...buttonProps}
      >
        {label}
      </Button>
      <ModalComponent
        opened={opened}
        closeModal={close}
        fullOnMobile={fullOnMobile}
      />
    </>
  )
}

export default ButtonWithModal
