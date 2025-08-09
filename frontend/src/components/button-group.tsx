import { useState, type ReactNode } from 'react'
import {
  UnstyledButton,
  FloatingIndicator,
  Group,
  Text,
  Stack,
} from '@mantine/core'
import { useUncontrolled } from '@mantine/hooks'

export interface ButtonGroupOption<T extends string = string> {
  icon?: ReactNode
  value: T
  label: string
}

interface ButtonGroupProps<T extends string> {
  label?: string
  options: ButtonGroupOption<T>[]
  defaultValue?: T
  value?: T
  onChange?: (value: T) => void
  error?: ReactNode
  required?: boolean
}

export function ButtonGroup<T extends string>({
  label,
  options,
  value,
  defaultValue,
  onChange,
}: ButtonGroupProps<T>) {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null)
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({})

  const [_value, handleChange] = useUncontrolled({
    value,
    defaultValue,
    onChange,
  })

  const active = options.findIndex((option) => option.value === _value)

  const setControlRef = (index: number) => (node: HTMLButtonElement) => {
    controlsRefs[index] = node
    setControlsRefs(controlsRefs)
  }

  const controls = options.map((item, index) => (
    <UnstyledButton
      key={item.value}
      variant="default"
      className="flex-1 flex justify-center items-center gap-2 py-1.5 line-clamp-1 rounded-md text-neutral-700 transition-colors hover:text-black hover:bg-neutral-200 data-[active]:text-white"
      ref={setControlRef(index)}
      onClick={() => handleChange(item.value)}
      mod={{ active: _value === item.value }}
    >
      <Text component="span" className="relative z-[1]">
        {item.icon}
      </Text>
      <Text component="span" className="relative z-[1] font-normal">
        {item.label}
      </Text>
    </UnstyledButton>
  ))

  return (
    <Stack className=" flex-1 " gap={2}>
      {label && (
        <Text
          component="label"
          className=" inline-block break-words cursor-default"
          fw={500}
          fz="sm"
        >
          {label}
        </Text>
      )}
      <Group
        className="relative bg-neutral-50 rounded-md p-1 border border-neutral-200"
        ref={setRootRef}
      >
        {controls}
        <FloatingIndicator
          className="rounded-md"
          bg="primary"
          target={controlsRefs[active]}
          parent={rootRef}
        />
      </Group>
    </Stack>
  )
}
