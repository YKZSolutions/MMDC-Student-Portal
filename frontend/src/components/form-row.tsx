import { Group, Text, Input, Flex } from '@mantine/core'
import { IconCategory } from '@tabler/icons-react'
import React, { type ComponentPropsWithoutRef } from 'react'

type FormRowProps = {
  icon?: React.ReactNode
  label: string
  placeholder?: string
}

export default function FormRow({
  icon = <IconCategory />,
  label,
  placeholder = 'Empty',
}: FormRowProps) {
  return (
    <Group>
      <Group gap="xs" align="center" w={125}>
        {icon}
        <Text>{label}</Text>
      </Group>

      {/* Flexible input wrapper */}
      <Flex flex={1}>
        <Input
          variant="unstyled"
          placeholder={placeholder}
          fw={400}
          size="md"
          w="100%"
        />
      </Flex>
    </Group>
  )
}
