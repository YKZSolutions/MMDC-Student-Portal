import { Box, Flex, Text } from '@mantine/core'
import React from 'react'

type NoItemFoundProps = {
  icon?: React.ReactNode
  title?: string
  subtitle?: string
}

export default function NoItemFound({
  icon,
  title = 'No items found',
  subtitle,
}: NoItemFoundProps) {
  return (
    <Box py="xl">
      <Flex align="center" justify="center" direction="column" c="dark.3">
        {icon}
        <Text mt="sm" fw={600}>
          {title}
        </Text>
        {subtitle && (
          <Text fz="sm" c="dark.2">
            {subtitle}
          </Text>
        )}
      </Flex>
    </Box>
  )
}


