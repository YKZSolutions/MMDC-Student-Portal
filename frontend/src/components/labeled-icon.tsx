import {
  ActionIcon,
  Tooltip,
  type ActionIconFactory,
  type ActionIconProps,
  type ElementProps,
} from '@mantine/core'
import type { ReactNode } from 'react'

interface LabeledIconProps
  extends ActionIconProps,
    Omit<ElementProps<'button'>, keyof ActionIconProps> {
  label: string
  children: ReactNode
}

export default function LabeledIcon({
  label,
  children,
  variant = 'subtle',
  ...props
}: LabeledIconProps) {
  return (
    <Tooltip label={label}>
      <ActionIcon variant={variant} {...props}>
        {children}
      </ActionIcon>
    </Tooltip>
  )
}
