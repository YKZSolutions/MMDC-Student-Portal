import React, { type ComponentPropsWithoutRef, type JSX, useState } from 'react'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  type BoxProps,
  Card,
  Group,
  type ModalProps,
  Stack,
  Text,
  Title,
} from '@mantine/core'

type ActionCardProps = {
  title: string
  description: string
  icon: JSX.Element
  modalComponent: React.ComponentType<ModalProps>
  fullOnMobile?: boolean
} & ComponentPropsWithoutRef<typeof Card> &
  BoxProps

const CardWithModal = ({
  title,
  description,
  icon,
  modalComponent: ModalComponent,
  fullOnMobile = true,
  ...cardProps
}: ActionCardProps) => {
  const [hovered, setHovered] = useState(false)
  const [opened, { open, close }] = useDisclosure(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const shouldFull = isMobile && fullOnMobile

  return (
    <>
      <Card
        withBorder
        radius="md"
        p="xs"
        shadow={hovered ? 'sm' : 'xs'}
        style={{ cursor: 'pointer' }}
        onClick={open}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...cardProps}
      >
        <Stack gap={'xs'}>
          <Group gap={'xs'}>
            {icon}
            <Title order={4} fw={500}>
              {title}
            </Title>
          </Group>
          <Text size={'sm'}>{description}</Text>
        </Stack>
      </Card>
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

export default CardWithModal
