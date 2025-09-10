import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/react'
import { CollisionPriority } from '@dnd-kit/abstract'

interface DroppableProps {
  id: string
  children: ReactNode | ((isOver: boolean) => ReactNode)
}

export default function Droppable({ id, children }: DroppableProps) {
  const { ref, isDropTarget } = useDroppable({
    id: id,
    type: 'column',
    accept: 'item',
    collisionPriority: CollisionPriority.Low,
  })

  const content =
    typeof children === 'function' ? children(isDropTarget) : children

  return <div ref={ref}>{content}</div>
}
