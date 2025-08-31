import { useState } from 'react'
import { Select, type SelectProps } from '@mantine/core'
import {
  IconBook,
  IconCalendar,
  IconSchool,
  IconBriefcase,
  IconStar,
} from '@tabler/icons-react'

const iconMap = {
  book: IconBook,
  calendar: IconCalendar,
  school: IconSchool,
  briefcase: IconBriefcase,
  star: IconStar,
}

export interface IconSelectorProps
  extends Omit<SelectProps, 'data' | 'value' | 'onChange'> {
  value?: keyof typeof iconMap
  onChange?: (val: keyof typeof iconMap | null) => void
}

export function IconSelector({
  value,
  onChange,
  label = 'Icon',
  placeholder = 'Pick an icon',
  ...props
}: IconSelectorProps) {
  const [internalValue, setInternalValue] = useState<
    keyof typeof iconMap | null
  >(value ?? null)

  const handleChange = (val: string | null) => {
    const casted = val as keyof typeof iconMap | null
    setInternalValue(casted)
    onChange?.(casted)
  }

  return (
    <Select
      label={label}
      placeholder={placeholder}
      value={internalValue}
      onChange={handleChange}
      data={Object.keys(iconMap).map((key) => ({
        value: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }))}
      renderOption={({ option }) => {
        const Icon = iconMap[option.value as keyof typeof iconMap]
        return (
          <div className="flex items-center gap-2">
            <Icon size={18} />
            <span>{option.label}</span>
          </div>
        )
      }}
      rightSection={
        internalValue
          ? (() => {
              const Icon = iconMap[internalValue]
              return <Icon size={18} />
            })()
          : null
      }
      {...props} // <-- spread so you can pass className, styles, radius, etc.
    />
  )
}
