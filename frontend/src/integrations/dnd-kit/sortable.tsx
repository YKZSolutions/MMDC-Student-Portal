import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/react/sortable'
import type { ReactNode } from 'react'

interface SortableProps {
  id: string
  index: number
  column: UniqueIdentifier
  children:
    | ReactNode
    | ((params: {
        handleRef: (element: Element | null) => void
        isDragging: boolean
      }) => ReactNode)
}

export default function Sortable({
  id,
  index,
  column,
  children,
}: SortableProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
  })

  const content =
    typeof children === 'function'
      ? children({ handleRef, isDragging })
      : children

  return <div ref={ref}>{content}</div>
}
