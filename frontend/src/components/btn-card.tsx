import React, { useState } from 'react'
import { Card, Group, Stack, Text, Title } from '@mantine/core'

type BtnCardProps = {
  title: string
  icon: React.ReactNode
  description: string
  onClick: () => void
}
const BtnCard = ({ title, icon, description, ...props }: BtnCardProps) => {
  const [hovered, setHovered] = useState(false)

  return (
    <Card
      withBorder
      radius="md"
      p="xs"
      shadow={hovered ? 'sm' : 'xs'}
      style={{ cursor: 'pointer' }}
      mih={100}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
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
  )
}

export default BtnCard
