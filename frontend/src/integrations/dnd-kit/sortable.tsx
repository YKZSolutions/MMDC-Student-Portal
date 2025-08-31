import type { Data } from '@dnd-kit/abstract'
import type { UniqueIdentifier } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/react/sortable'
import type { ReactNode } from 'react'

interface SortableProps<T> {
  id: string
  index: number
  column: UniqueIdentifier
  data?: T
  children:
    | ReactNode
    | ((params: {
        handleRef: (element: Element | null) => void
        isDragging: boolean
        data?: T
      }) => ReactNode)
}

export default function Sortable<T extends Data>({
  id,
  index,
  column,
  data,
  children,
}: SortableProps<T>) {
  const { ref, handleRef, isDragging } = useSortable({
    id: id,
    index,
    type: 'item',
    accept: 'item',
    group: column,
    data,
  })

  const content =
    typeof children === 'function'
      ? children({ handleRef, isDragging, data })
      : children

  return <div ref={ref}>{content}</div>
}
