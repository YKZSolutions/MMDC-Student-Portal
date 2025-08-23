import { useDisclosure } from '@mantine/hooks'
import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import React from 'react'

type ButtonWithModalProps = {
  label: string
  modalComponent: React.ComponentType<{ opened: boolean, closeModal: () => void }>
}

const ButtonWithModal = ({
  label,
  modalComponent: ModalComponent,
}: ButtonWithModalProps) => {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Button
        mb={'md'}
        bg={'secondary'}
        leftSection={<IconPlus />}
        onClick={open}
      >
        {label}
      </Button>
      <ModalComponent opened={opened} closeModal={close} />
    </>
  )
}

export default ButtonWithModal

