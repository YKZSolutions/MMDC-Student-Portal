import type { Data } from '@dnd-kit/abstract'
import { useDraggable } from '@dnd-kit/react'
import type { ReactNode } from 'react'

interface DraggableProps<T> {
  id: string
  data?: T
  children:
    | ReactNode
    | ((params: {
        handleRef: (element: Element | null) => void
        isDragging: boolean
        data?: T
      }) => ReactNode)
}

export default function Draggable<T extends Data>({
  id,
  data,
  children,
}: DraggableProps<T>) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: id,
    type: 'item',
    data,
  })

  const content =
    typeof children === 'function'
      ? children({ handleRef, isDragging, data })
      : children

  return <div ref={ref}>{content}</div>
}
