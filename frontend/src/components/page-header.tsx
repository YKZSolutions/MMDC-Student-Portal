import { Box, Stack, Text, Title } from '@mantine/core'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Stack gap={0}>
      <Title c="dark.7" variant="hero" order={2} fw={700}>
        {title}
      </Title>
      {subtitle && (
        <Text fw={500} c="dark.3" fz="md">
          {subtitle}
        </Text>
      )}
    </Stack>
  )
}
