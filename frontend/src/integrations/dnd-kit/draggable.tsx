import { useDraggable, type DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { ReactNode } from 'react'

interface DraggableProps {
  id: string
  children:
    | ReactNode
    | ((
        listeners: SyntheticListenerMap | undefined,
        attributes: DraggableAttributes,
        isDragging?: boolean,
      ) => ReactNode)
}

export default function Draggable({ id, children }: DraggableProps) {
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: id,
  })

  const content =
    typeof children === 'function'
      ? (
          children as (
            listeners: SyntheticListenerMap | undefined,
            attributes: DraggableAttributes,
            isDragging?: boolean,
          ) => ReactNode
        )(listeners, attributes, isDragging)
      : children

  return <div ref={setNodeRef}>{content}</div>
}
