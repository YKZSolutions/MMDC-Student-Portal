import { Box, Button } from '@mantine/core'
import {
  IconLayoutGridFilled,
  IconList,
  type ReactNode,
} from '@tabler/icons-react'

type ViewSelectorButtonProps = {
  value: 'grid' | 'list'
  onSelect: (value: 'grid' | 'list') => void
}

export function ViewSelectorButton({
  value,
  onSelect,
}: ViewSelectorButtonProps) {
  return (
    <Button.Group>
      <SelectorButton
        active={value === 'grid'}
        onClick={() => onSelect('grid')}
        icon={<IconLayoutGridFilled size={20} />}
      />
      <SelectorButton
        active={value === 'list'}
        onClick={() => onSelect('list')}
        icon={<IconList size={20} />}
      />
    </Button.Group>
  )
}

type SelectorButtonProps = {
  active: boolean
  icon: ReactNode
  onClick: () => void
}

function SelectorButton({ active, icon, onClick }: SelectorButtonProps) {
  return (
    <Button
      variant="default"
      radius={'md'}
      bg={active ? 'gray.3' : 'gray.0'}
      onClick={onClick}
    >
      <Box color={active ? 'black' : 'dark.2'}>{icon}</Box>
    </Button>
  )
}
