import {
  Button,
  Popover,
  Overlay,
  Text,
  useMantineTheme,
} from '@mantine/core'
import React, { useRef, useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { IconMessageChatbot, IconX } from '@tabler/icons-react'

type ChatbotProps = {
  isChatbotOpen: boolean
  setChatbotOpen: (isOpen: boolean) => void
  isChatbotFabHidden: boolean
  setChatbotFabHidden: (isHidden: boolean) => void
}

const Chatbot = ({ isChatbotOpen, setChatbotOpen, isChatbotFabHidden, setChatbotFabHidden }: ChatbotProps) => {
  const theme = useMantineTheme()
  const nodeRef = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPosition = useRef({ x: 0, y: 0 })
  const isDrag = useRef(false)

  // Set initial position to bottom right
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 200,
      y: window.innerHeight - 100
    })
  }, [])

  // Calculate optimal popover position based on FAB position
  const getPopoverPosition = () => {
    const screenHeight = window.innerHeight
    const fabY = position.y

    // If FAB is in upper half of screen, show popover below
    if (fabY < screenHeight / 2) {
      return 'bottom'
    }
    // If FAB is in lower half, show popover above
    else {
      return 'top'
    }
  }
  const isInCenterDropZone = (x: number, y: number) => {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 6
    const dropZoneSize = 100 // 200px radius from center

    const distance = Math.sqrt(
      Math.pow(x + 100 - centerX, 2) + Math.pow(y + 25 - centerY, 2)
    )

    return distance < dropZoneSize
  }

  const handleDragStart = (e: any, data: any) => {
    dragStartPosition.current = { x: data.x, y: data.y }
    isDrag.current = false
  }

  const handleDrag = (e: any, data: any) => {
    const dx = Math.abs(data.x - dragStartPosition.current.x)
    const dy = Math.abs(data.y - dragStartPosition.current.y)
    
    // Consider it a drag if moved more than 5 pixels
    if (dx > 5 || dy > 5) {
      isDrag.current = true
      setIsDragging(true)
    }
    
    const newX = Math.max(0, Math.min(data.x, window.innerWidth - 200))
    const newY = Math.max(0, Math.min(data.y, window.innerHeight - 50))
    setPosition({ x: newX, y: newY })
  }

  const handleDragStop = (e: any, data: any) => {
    if (isDrag.current) {
      // Check if dropped in center zone
      if (isInCenterDropZone(data.x, data.y)) {
        setChatbotFabHidden(true)
        setChatbotOpen(false)
        setPosition({ x: window.innerWidth - 200, y: window.innerHeight - 100 })
      }
    }
    
    // Reset drag state
    setIsDragging(false)
    isDrag.current = false
  }

  const handleClick = () => {
    // Only open if it wasn't a drag operation
    if (!isDrag.current) {
      setChatbotOpen(!isChatbotOpen)
    }
  }

  const handleModalClose = () => {
    setChatbotOpen(false)
    // Don't automatically show FAB - let the parent component handle this
  }

  if (isChatbotFabHidden) return null

  return (
    <>
      {/* Drop zone indicator - shows when dragging */}
      {isDragging && (
        <div
          className="fixed top-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-blue-500 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
          style={{ zIndex: 999, pointerEvents: 'none' }}
        >
          <Text className="text-center text-blue-600">
            Drop to hide Chatbot
          </Text>
        </div>
      )}

      {/* Dim the background when dragging */}
      {isDragging && (
        <Overlay opacity={0.5} />
      )}

      {/* Draggable FAB */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden'
      }}>
        <Draggable
          nodeRef={nodeRef}
          position={position}
          onStart={handleDragStart}
          onDrag={handleDrag}
          onStop={handleDragStop}
          bounds="body"
        >
          <div
            ref={nodeRef}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              cursor: isDragging ? 'grabbing' : 'grab',
              pointerEvents: 'auto',
            }}
          >
            <Popover
              opened={isChatbotOpen}
              onClose={handleModalClose}
              position={getPopoverPosition()}
              width={350}
              withArrow
              shadow="lg"
              radius="md"
              closeOnClickOutside
              closeOnEscape
            >
              <Popover.Target>
                <Button
                  onClick={handleClick}
                  variant="filled"
                  color={theme.primaryColor}
                  size="lg"
                  radius="xl"
                  leftSection={<IconMessageChatbot size={24} />}
                  style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    transition: isDragging ? 'none' : 'transform 0.2s ease',
                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                >
                  Chat with us
                </Button>
              </Popover.Target>

              <Popover.Dropdown
                style={{
                  padding: 0,
                  height: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: `1px solid ${theme.colors.gray[3]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.colors[theme.primaryColor][0],
                  borderRadius: '8px 8px 0 0',
                }}>
                  <Text fw={600} size="md">Chat Support</Text>
                  <Button
                    variant="subtle"
                    size="xs"
                    onClick={handleModalClose}
                    style={{ minWidth: 'auto', padding: '4px' }}
                  >
                    <IconX size={16} />
                  </Button>
                </div>

                {/* Chat messages area */}
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: theme.colors.gray[1],
                    borderRadius: '12px 12px 12px 4px',
                    alignSelf: 'flex-start',
                    maxWidth: '85%',
                  }}>
                    <Text size="sm">
                      Hello! Welcome to our support chat. How can I help you today?
                    </Text>
                  </div>

                  <Text size="xs" c="dimmed" ta="center" mt="md">
                    Start typing to continue the conversation...
                  </Text>
                </div>

                {/* Input area */}
                <div style={{
                  padding: '16px 20px',
                  borderTop: `1px solid ${theme.colors.gray[3]}`,
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}>
                  <div style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: `1px solid ${theme.colors.gray[4]}`,
                    borderRadius: '20px',
                    backgroundColor: theme.colors.gray[0],
                    fontSize: '14px',
                    color: theme.colors.gray[6],
                    cursor: 'text',
                  }}>
                    Type your message...
                  </div>
                  <Button
                    size="sm"
                    radius="xl"
                    style={{ minWidth: 'auto', paddingLeft: '16px', paddingRight: '16px' }}
                  >
                    Send
                  </Button>
                </div>
              </Popover.Dropdown>
            </Popover>
          </div>
        </Draggable>
      </div>
    </>
  )
}

export default Chatbot