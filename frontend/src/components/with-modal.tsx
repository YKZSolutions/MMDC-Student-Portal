import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  type BoxProps,
  Button,
  Card,
  Group,
  type ModalProps,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core'
import React, {
  type ComponentPropsWithoutRef,
  type JSX,
  useEffect,
  useState,
} from 'react'

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
  const [opened, { open, close }] = useDisclosure(false)
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const shouldFull = isMobile && fullOnMobile

  // Create a unique key based on the modal component name
  const modalKey = `modalOpen-${ModalComponent.displayName || ModalComponent.name}`

  useEffect(() => {
    const savedState = sessionStorage.getItem(modalKey)
    if (savedState === 'true') {
      open()
    }
  }, [open, modalKey])

  const handleClose = () => {
    sessionStorage.setItem(modalKey, 'false')
    close()
  }

  const handleOpen = () => {
    sessionStorage.setItem(modalKey, 'true')
    open()
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
  const [hovered, setHovered] = useState(false)

  return (
    <WithModal
      modalComponent={props.modalComponent}
      fullOnMobile={props.fullOnMobile}
    >
      {({ onClick }) => (
        <Card
          withBorder
          radius="md"
          p="xs"
          shadow={hovered ? 'sm' : 'xs'}
          style={{ cursor: 'pointer' }}
          mih={100}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={onClick}
          {...props}
        >
          <Stack gap={'xs'}>
            <Group gap={'xs'}>
              {props.icon}
              <Title order={4} fw={500}>
                {props.title}
              </Title>
            </Group>
            <Text size={'sm'}>{props.description}</Text>
          </Stack>
        </Card>
      )}
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
