import {
  IconBook,
  IconCircle,
  IconCircleCheck,
  IconEdit,
  IconFlag,
  IconPencil,
  type IconProps,
  IconWriting,
} from '@tabler/icons-react'
import { type BoxProps, useMantineTheme } from '@mantine/core'

type ModuleItemIconProps = Omit<IconProps, 'size'> & {
  type: string
  size?: number
} & BoxProps

type CompletedStatusIconProps = Omit<IconProps, 'size' | 'color'> & {
  status: string
  size?: number
} & BoxProps

const ModuleItemIcon = ({ type, size = 36, ...props }: ModuleItemIconProps) => {
  const theme = useMantineTheme()
  if (type === 'readings')
    return <IconBook size={size} color={`${theme.colors.dark[3]}`} {...props} />
  if (type === 'assignment')
    return (
      <IconPencil size={size} color={`${theme.colors.dark[3]}`} {...props} />
    )
  if (type === 'draft')
    return <IconEdit size={size} color={`${theme.colors.dark[3]}`} {...props} />
  if (type === 'milestone')
    return <IconFlag size={size} color={`${theme.colors.dark[3]}`} {...props} />
  if (type === 'other')
    return (
      <IconWriting size={size} color={`${theme.colors.dark[3]}`} {...props} />
    )

  return <IconBook size={size} />
}

const CompletedStatusIcon = ({
  status,
  size = 32,
  ...props
}: CompletedStatusIconProps) => {
  const theme = useMantineTheme()
  if (
    status === 'ready-for-grading' ||
    status === 'graded' ||
    status === 'read'
  ) {
    return (
      <IconCircleCheck
        size={size}
        color={`${theme.colors.blue[4]}`}
        fill={theme.colors.blue[0]}
        {...props}
      />
    )
  }

  return <IconCircle size={size} color="gray" {...props} />
}

export { ModuleItemIcon, CompletedStatusIcon }
export type { ModuleItemIconProps, CompletedStatusIconProps }
