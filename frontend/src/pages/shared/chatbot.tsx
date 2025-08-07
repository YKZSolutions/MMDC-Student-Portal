import {
  ActionIcon,
  Button,
  Container,
  Group,
  Modal,
  Text,
  useMantineTheme,
} from '@mantine/core'
import React, { useRef, useState, useEffect } from 'react'
import Draggable, { type DraggableBounds, type DraggableEvent, type DraggableData } from 'react-draggable'
import { IconMessageChatbot, IconUser, IconX } from '@tabler/icons-react'

// This is a workaround for react-draggable with React 19
const DraggableComponent = ({
  children,
  style,
  dragActions,
  resetPositionOnRelease = false,
}: {
  children: React.ReactNode
  style?: {
    position?: 'fixed' | 'absolute' | 'relative' | 'sticky' | 'static' | 'inherit'
    bottom?: string
    right?: string
    zIndex?: number
    cursor?: string
  }
  dragActions?: () => void
  resetPositionOnRelease?: boolean
}) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = (e: any, data: any) => {
    if (!resetPositionOnRelease) {
      setPosition({ x: data.x, y: data.y })
    }

    if (dragActions) {
      dragActions()
    }
  }

  const handleStart = () => {
    setIsDragging(true)
  }

  const handleStop = () => {
    setIsDragging(false)
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
      bounds="body"
      defaultPosition={{
        x: window.innerWidth - 150,
        y: window.innerHeight - 150,
      }}
    >
      <div
        ref={nodeRef}
        style={{
          position: 'fixed',
          zIndex: style?.zIndex || 1000,
          cursor: isDragging ? 'grabbing' : 'grab',
          ...style
        }}
      >
        {children}
      </div>
    </Draggable>
  )
}

type ChatbotProps = {
  isChatbotOpen: boolean
  setChatbotOpen: (isOpen: boolean) => void
  isChatbotFabHidden: boolean
  setChatbotFabHidden: (isHidden: boolean) => void
}

const Chatbot = ({ isChatbotOpen, setChatbotOpen, isChatbotFabHidden, setChatbotFabHidden }: ChatbotProps) => {
  const theme = useMantineTheme();

  // We use a ref to store the timer ID so we can clear it later.
  const longPressTimer = useRef(null);
  // We use state to track if a long press has occurred.
  const [isLongPress, setIsLongPress] = useState(false);
  // New state to track if a drag has occurred.
  const [hasBeenDragged, setHasBeenDragged] = useState(false);

  // The long press duration in milliseconds.
  const LONG_PRESS_DURATION = 500;

  // This function starts the long press timer.
  const handleOnStart = () => {
    // Reset the drag state at the start of a press
    setHasBeenDragged(false);
    // Set a timer to trigger the long press state after the duration.
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
    }, LONG_PRESS_DURATION);
  };

  // This function gets called continuously when the button is dragged.
  const handleOnDrag = () => {
    setHasBeenDragged(true);
    clearTimeout(longPressTimer.current);
  };

  // This function is for handling the case when the user releases the button,
  // either after a click or a drag.
  const handleOnStop = () => {
    clearTimeout(longPressTimer.current);

    // Only open the chatbot if a long press has NOT occurred AND a drag has NOT occurred.
    if (!isLongPress && !hasBeenDragged) {
      console.log('Click detected, opening chatbot.');
      setChatbotFabHidden(true);
      setChatbotOpen(true);
      // In a real app, this is where you would call setChatbotOpen(true).
    } else {
      console.log('Action prevented due to long press or drag.');
    }

    // Always reset the long press and drag states after the event is over.
    setIsLongPress(false);
    setHasBeenDragged(false);
  };

  const handleOnChatModalClose = () => {
    setChatbotOpen(false);
    setChatbotFabHidden(false);
  }

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
      <DraggableComponent dragActions={handleOnDrag}>
        <Button
          onMouseDown={handleOnStart}
          onTouchStart={handleOnStart}
          onMouseUp={handleOnStop}
          onTouchEnd={handleOnStop}
          onMouseLeave={handleOnStop}
          hidden={isChatbotFabHidden}
          variant="filled"
          color={theme.primaryColor}
          size="lg"
          radius="xl"
          leftSection={<IconMessageChatbot size={24} />}
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s',
            ':hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          Chat with us
        </Button>
      </DraggableComponent>

      <Modal
        opened={isChatbotOpen}
        onClose={handleOnChatModalClose}
        title="Chat with our support"
        size="lg"
        radius="md"
        withOverlay={false}
      >
        <div style={{ minHeight: '300px' }}>
          <Text>Chat interface will go here</Text>
        </div>
      </Modal>
    </div>
  );
}

export default Chatbot