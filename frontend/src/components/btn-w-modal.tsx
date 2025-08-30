import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { type BoxProps, Button, type ModalProps } from '@mantine/core'
import React, { type ComponentPropsWithoutRef, type JSX } from 'react'

type ButtonWithModalProps = {
  label?: string | JSX.Element
  icon?: JSX.Element
  modalComponent: React.ComponentType<ModalProps>
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
  const isMobile = useMediaQuery('(max-width: 768px)')
  const shouldFull = isMobile && fullOnMobile

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
        onClose={close}
        fullScreen={shouldFull}
        radius={shouldFull ? 0 : 'lg'}
        transitionProps={{
          transition: shouldFull ? 'fade' : 'fade-down',
          duration: 200,
        }}
      />
    </>
  )
}

export default ButtonWithModal
