import { useLocalStorage, useMediaQuery } from '@mantine/hooks'
import {
  type BoxProps,
  Button,
  Card,
  type ModalProps,
  useMantineTheme,
} from '@mantine/core'
import React, { type ComponentPropsWithoutRef, type JSX } from 'react'
import BtnCard from '@/components/btn-card.tsx'

interface WithModalProps<T = any> {
  modalComponent: React.ComponentType<T & ModalProps>
  fullOnMobile?: boolean
  modalProps?: Omit<T, keyof ModalProps>
  children: (props: { onClick: () => void }) => JSX.Element
}

const WithModal = <T,>({
  modalComponent: ModalComponent,
  fullOnMobile = true,
  modalProps,
  children,
}: WithModalProps<T>) => {
  const theme = useMantineTheme()
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const shouldFull = isMobile && fullOnMobile

  // Create a unique key based on the modal component name
  const modalKey = `modalOpen-${ModalComponent.displayName}`

  const [opened, setOpened] = useLocalStorage<boolean>({
    key: modalKey,
    defaultValue: false,
  })

  const handleClose = () => {
    setOpened(false)
  }

  const handleOpen = () => {
    setOpened(true)
  }

  return (
    <>
      {children({ onClick: handleOpen })}
      <ModalComponent
        opened={opened}
        onClose={handleClose}
        fullScreen={shouldFull}
        radius={shouldFull ? 0 : 'lg'}
        transitionProps={{
          transition: shouldFull ? 'fade' : 'fade-down',
          duration: 200,
        }}
        {...(modalProps as T)}
      />
    </>
  )
}

type CardWithModalProps<T = any> = {
  title: string
  description: string
  icon: JSX.Element
  modalComponent: React.ComponentType<T & ModalProps>
  modalProps?: T
  fullOnMobile?: boolean
} & ComponentPropsWithoutRef<typeof Card> &
  BoxProps

const CardWithModal = <T,>(props: CardWithModalProps<T>) => {
  return (
    <WithModal
      modalComponent={props.modalComponent}
      fullOnMobile={props.fullOnMobile}
    >
      {({ onClick }) => <BtnCard {...props} onClick={onClick} />}
    </WithModal>
  )
}

type ButtonWithModalProps<T = any> = {
  label?: string | JSX.Element
  icon?: JSX.Element
  modalComponent: React.ComponentType<T & ModalProps>
  modalProps?: T
  fullOnMobile?: boolean
} & Omit<ComponentPropsWithoutRef<typeof Button>, 'onClick' | 'leftSection'> &
  BoxProps

const ButtonWithModal = <T,>(props: ButtonWithModalProps<T>) => (
  <WithModal
    modalComponent={props.modalComponent}
    fullOnMobile={props.fullOnMobile}
  >
    {({ onClick }) => (
      <Button
        onClick={onClick}
        leftSection={props.icon}
        bg={'secondary'}
        {...props}
      >
        {props.label}
      </Button>
    )}
  </WithModal>
)

export { WithModal, CardWithModal, ButtonWithModal }
