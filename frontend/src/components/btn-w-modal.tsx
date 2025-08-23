import { useDisclosure } from '@mantine/hooks'
import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import React, { type JSX } from 'react'

type ButtonWithModalProps = {
  label: string
  icon?: JSX.Element
  modalComponent: React.ComponentType<{ opened: boolean, closeModal: () => void }>
}

const ButtonWithModal = ({
  label,
  icon,
  modalComponent: ModalComponent,
}: ButtonWithModalProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Button
        mb={'md'}
        bg={'secondary'}
        leftSection={icon}
        onClick={open}
      >
        {label}
      </Button>
      <ModalComponent opened={opened} closeModal={close} />
    </>
  )
}

export default ButtonWithModal

