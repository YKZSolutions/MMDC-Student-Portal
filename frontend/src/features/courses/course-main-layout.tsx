import React from 'react'
import {
  Box,
  Group,
  type GroupProps,
  Stack,
  type StackProps,
  Title,
  type TitleProps,
} from '@mantine/core'

type CourseMainLayoutProps = {
  title: string
  titleProps?: TitleProps
  headerProps?: GroupProps
  headerRightSection?: React.ReactNode
  children: React.ReactNode
} & StackProps

const CourseMainLayout = ({
  title,
  titleProps,
  headerProps,
  headerRightSection,
  children,
  ...stackProps
}: CourseMainLayoutProps) => {
  return (
    <Stack {...stackProps} gap={'md'} p={'md'}>
      {/*Header*/}
      <Group justify="space-between" align="center" {...headerProps}>
        <Title {...titleProps}>{title}</Title>
        {headerRightSection}
      </Group>
      <Box>{children}</Box>
    </Stack>
  )
}

export default CourseMainLayout
