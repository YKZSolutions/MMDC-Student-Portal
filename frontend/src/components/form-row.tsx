import { Box, Group, Input, Text, Tooltip } from '@mantine/core'
import React from 'react'

type FormRowProps = {
  icon: React.ReactNode
  label: string
  children?: React.ReactNode
}

function FormRow({ icon, label, children }: FormRowProps) {
  return (
    <Group align="center" w="100%">
      {/* Label */}
      <Group w={145} align="center">
        <Tooltip label={label} position="top">
          <Group align="center" w={'100%'} wrap={'nowrap'}>
            <Box>{icon}</Box>
            <Text lineClamp={2}>{label}</Text>
          </Group>
        </Tooltip>
      </Group>
      {/* Input */}
      {children ? (
        children
      ) : (
        <Input variant="unstyled" placeholder={'Empty'} fw={400} size="md" />
      )}
    </Group>
  )
}

export default FormRow
