import {
  Button,
  CloseButton,
  Input,
  Popover,
  Skeleton,
  Text,
  useMantineTheme,
} from '@mantine/core'
import React, { useRef, useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { IconMessageChatbot } from '@tabler/icons-react'
import DropZoneIndicator from '@/features/chatbot/drop-zone-indicator'
import ChatHeader from '@/features/chatbot/chat-header'
import ChatMessages from '@/features/chatbot/chat-messages'
import ChatInput from '@/features/chatbot/chat-input'
import { IconMessageChatbot, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { chatbotControllerPromptMutation } from '@/integrations/api/client/@tanstack/react-query.gen.ts'

type ChatbotProps = {
  isChatbotOpen: boolean
  setChatbotOpen: (isOpen: boolean) => void
  isChatbotFabHidden: boolean
  setChatbotFabHidden: (isHidden: boolean) => void
}

const Chatbot = ({
  isChatbotOpen,
  setChatbotOpen,
  isChatbotFabHidden,
  setChatbotFabHidden,
}: ChatbotProps) => {
  const theme = useMantineTheme()
  const nodeRef = useRef<HTMLDivElement>(null)
  const dragStartPosition = useRef({ x: 0, y: 0 })
  const isDrag = useRef(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: 'Hello! How can I help you today?' },
  ])

  const addMessage = (userInput: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userInput },
      { role: 'bot', content: 'Thanks for your message! (placeholder reply)' }, //TODO: this should be replaced with a bot response
    ])
  }

  useEffect(() => {
    // set the initial position of the chatbot to the bottom right corner of the screen
    setPosition({
      x: window.innerWidth - 200,
      y: window.innerHeight - 100,
    })
  }, [])

  const isInCenterDropZone = (x: number, y: number) => {
    // The drop zone is the area in the center of the screen where the chatbot will close
    // when dragged there.
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 6
    const distance = Math.hypot(x + 100 - centerX, y + 25 - centerY) // +100 and +25 are the offsets for the drop zone
    return distance < 100
  }

  const handleDragStart = (_: any, data: any) => {
    // record the starting position of the drag
    dragStartPosition.current = { x: data.x, y: data.y }
    isDrag.current = false
  }

  const handleDrag = (_: any, data: any) => {
    const dx = Math.abs(data.x - dragStartPosition.current.x)
    const dy = Math.abs(data.y - dragStartPosition.current.y)

    if (dx > 5 || dy > 5) {
      // if the user has dragged more than 5px, consider it a drag
      isDrag.current = true
      setIsDragging(true)
    }

    // keep the chatbot within the bounds of the screen
    const newX = Math.max(0, Math.min(data.x, window.innerWidth - 200)) // 200 is the width of the chatbot
    const newY = Math.max(0, Math.min(data.y, window.innerHeight - 50)) // 50 is the height of the chatbot
    setPosition({ x: newX, y: newY })
  }

  const handleDragStop = (_: any, data: any) => {
    if (isDrag.current && isInCenterDropZone(data.x, data.y)) {
      isDrag.current = false

      // if the user has dragged to the center drop zone, close the chatbot
      setChatbotFabHidden(true)
      setChatbotOpen(false)
      setPosition({
        x: window.innerWidth - 200,
        y: window.innerHeight - 100,
      })
    }

    setIsDragging(false)
  }

  const handleClick = () => {
    // if the user has not dragged, toggle the chatbot open/closed
    if (!isDrag.current) {
      setChatbotOpen(!isChatbotOpen)
    }
  }

  const getPopoverPosition = () =>
    position.y < window.innerHeight / 2 ? 'bottom' : 'top'

  const handleModalClose = () => setChatbotOpen(false)

  if (isChatbotFabHidden) return null

  return (
    <>
      {isDragging && <DropZoneIndicator />}
      {isDragging && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
            zIndex: 998,
            pointerEvents: 'none',
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      >
        <Draggable
          nodeRef={nodeRef}
          position={position}
          onStart={handleDragStart}
          onDrag={handleDrag}
          onStop={handleDragStop}
          bounds="body"
          handle=".chatbot-drag-handle"
        >
          <div
            ref={nodeRef}
            style={{
              position: 'absolute',
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
                  className="chatbot-drag-handle"
                  onClick={handleClick}
                  variant="filled"
                  color={theme.colors['secondary'][0]}
                  size="lg"
                  radius="xl"
                  leftSection={<IconMessageChatbot size={24} />}
                  style={{
                    boxShadow:
                      '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.12)',
                    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                    userSelect: 'none',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      boxShadow:
                        '0 12px 32px rgba(0, 0, 0, 0.24), 0 8px 20px rgba(0, 0, 0, 0.12)',
                      transform: isDragging ? 'scale(1.05)' : 'scale(1.05)',
                    },
                  }}
                >
                  Chat with us
                </Button>
              </Popover.Target>

              <Popover.Dropdown
                style={{
                  padding: 0,
                  height: 500,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ChatHeader onClose={handleModalClose} />
                <ChatMessages messages={messages} />
                <ChatInput onSendInput={addMessage} />
              </Popover.Dropdown>
            </Popover>
          </div>
        </Draggable>
      </div>
    </>
  )
}

const ChatHeader = ({ onClose }: { onClose: () => void }) => {
  const theme = useMantineTheme()

  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: theme.colors["secondary"][0],
        borderRadius: '8px 8px 0 0',
      }}
    >
      <Text fw={600} c={theme.white} size="md">Chat Support</Text>
      <Button
        variant="subtle"
        size="xs"
        onClick={onClose}
        style={{ minWidth: 'auto', padding: 4 }}
      >
        <IconX size={16} color={theme.white} />
      </Button>
    </div>
  )
}

const BotMessage = ({message}: {message: string}) =>{
  const theme = useMantineTheme()
  return (
    <div
      style={{
        padding: 12,
        backgroundColor: theme.colors.gray[1],
        borderRadius: '12px 12px 12px 4px',
        alignSelf: 'flex-start',
        maxWidth: '85%',
      }}
    >
      <Text size="sm">
        {message}
      </Text>
    </div>
  )
}

const UserMessage = ({message}: {message: string}) =>{
  const theme = useMantineTheme()
  return (
    <div
      style={{
        padding: 12,
        backgroundColor: theme.colors.gray[0],
        borderRadius: '12px 12px 4px 12px',
        alignSelf: 'flex-end',
        maxWidth: '85%',
      }}
    >
      <Text size="sm">
        {message}
      </Text>
    </div>
  )
}

interface ChatMessagesProps {
  messages: Turn[];
  waitingBotResponse?: boolean;
  botError?: boolean;
}

const ChatMessages = ({ messages, waitingBotResponse = false, botError = false }: ChatMessagesProps) => {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {messages.map((msg, index) =>
        msg.role === 'user' ? (
          <UserMessage key={index} message={msg.content} />
        ) : msg.content === '__WAITING_FOR_BOT_RESPONSE__' ? (
          <div key={index} style={{alignSelf: 'flex-start', maxWidth: '85%'}}>
            <Skeleton height={24} radius="md" />
          </div>
        ) : msg.content === '__BOT_ERROR__' ? (
          <div key={index} style={{alignSelf: 'flex-start', maxWidth: '85%'}}>
            <Text size="sm" c="red" style={{maxWidth: '85%'}}>
              The bot encountered an error while processing your query.
            </Text>
          </div>
        ) : (
          <BotMessage key={index} message={msg.content} />
        )
      )}

      <Text size="xs" c="dimmed" ta="center" mt="md">
        Start typing to continue the conversation...
      </Text>

      {/*/!* Example interaction *!/*/}
      {/*<button onClick={() => addMessage('I need help with my account.')}>*/}
      {/*  Simulate Send*/}
      {/*</button>*/}
    </div>
  )
}

const ChatInput = ({onSendInput}: {onSendInput: (message: string) => void}) => {
  const theme = useMantineTheme()
  const [value, setValue] = useState('');

  return (
    <div
      style={{
        padding: '16px 20px',
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Input
        placeholder="Type your message..."
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rightSectionPointerEvents="all"
        radius="lg"
        rightSection={
          <CloseButton
            aria-label="Clear input"
            onClick={() => setValue('')}
            style={{ display: value ? undefined : 'none' }}
          />
        }
      />
      <Button
        onClick={() => {
          onSendInput(value);
          setValue('');
        }}
        size="sm"
        radius="xl"
        style={{
          padding: '0 16px',
          backgroundColor: theme.colors.secondary[6],
          color: theme.white,
        }}>
        Send
      </Button>
    </div>
  )
}

const DropZoneIndicator = () => (
  <div
    className="fixed top-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-blue-500 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
    style={{
      zIndex: 999,
      pointerEvents: 'none' }}
  >
    <Text className="text-center text-blue-600">Drop to hide chatbot</Text>
  </div>
)

export default Chatbot
