import React, { type ComponentPropsWithoutRef, type JSX, useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { type BoxProps, Card, Group, Stack, Text, Title } from '@mantine/core'
import type { CustomModalProp } from '@/components/types.ts'

type ActionCardProps = {
  title: string
  description: string
  icon: JSX.Element
  modalComponent: React.ComponentType<CustomModalProp>
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
  const [actionModalOpened, { open, close }] = useDisclosure(false)

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
        opened={actionModalOpened}
        closeModal={close}
        fullOnMobile={fullOnMobile}
      />
    </>
  )
}

export default CardWithModal
