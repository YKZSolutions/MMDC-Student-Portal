import {
  Affix,
  Box,
  Button,
  CloseButton,
  Group,
  Input,
  Popover,
  Skeleton,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import React, { useRef, useState, useEffect } from 'react'
import Draggable from 'react-draggable'
import { IconMessageChatbot, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { chatbotControllerPromptMutation } from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import type { Turn } from '@/integrations/api/client'

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

  const [messages, setMessages] = useState<Turn[]>([
    { role: 'model', content: 'Hello! How can I help you today?' },
  ])

  const { mutateAsync: create, isPending, isError, isSuccess } = useMutation(chatbotControllerPromptMutation())

  const addMessage = async (userInput: string) => {
    const res = await create({
      body: {
        question: userInput,
        sessionHistory: messages,
      },
    })

    const response: string = res.response

    setMessages((prev): Turn[] => {
      const newMessages: Turn[] = [
        ...prev,
        { role: 'user', content: userInput },
        { role: 'model', content: response },
      ]
      return newMessages.slice(-20) // Keep the last 10 interactions
    })
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
                p={0}
                h={'65%'}
              >
                <Stack h={'100%'}>
                  <ChatHeader onClose={handleModalClose} />
                  <ChatMessages messages={messages} isSending={isPending} isError={isError} />
                  <ChatInput onSendInput={addMessage} isSending={isPending} isSuccess={isSuccess} />
                </Stack>
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
    <Group
      p={'md'}
      justify={'space-between'}
      bg={theme.colors.secondary[0]}
      bdrs={'8px 8px 0 0'}
      style={{
        borderBottom: `1px solid ${theme.colors.gray[3]}`
      }}
    >
      <Text fw={600} c={theme.white} size="md">Chat Support</Text>
      <Button
        variant="subtle"
        size="xs"
        miw={'auto'}
        p={'0.25rem'}
        onClick={onClose}
        style={{ minWidth: 'auto', padding: 4 }}
      >
        <IconX size={16} color={theme.white} />
      </Button>
    </Group>
  )
}

const BotMessage = ({message}: {message: string}) =>{
  const theme = useMantineTheme()
  return (
    <Box
      p={'md'}
      bdrs={'12px 12px 12px 4px'}
      bg={theme.colors.gray[1]}
      maw = "85%"
      style={{
        alignSelf: 'flex-start',
      }}
    >
      <Text size="sm">
        {message}
      </Text>
    </Box>
  )
}

const UserMessage = ({message}: {message: string}) =>{
  const theme = useMantineTheme()
  return (
    <Box
      p={'md'}
      bdrs={'12px 12px 4px 12px'}
      bg={theme.colors.gray[1]}
      maw = "85%"
      style={{
        alignSelf: 'flex-end',
      }}
    >
      <Text size="sm">
        {message}
      </Text>
    </Box>
  )
}

interface ChatMessagesProps {
  messages: Turn[];
  isSending?: boolean;
  isError?: boolean;
}

const ChatMessages = ({ messages, isSending = false, isError = false }: ChatMessagesProps) => {
  return (
    <Stack
      gap = "sm"
      p={'lg'}
      flex={1}
      style={{
        overflowY: 'auto',
      }}
    >
      {messages.map((msg, index) =>
        msg.role === 'user' ? (
          <UserMessage key={index} message={msg.content} />
        ) : (
          <BotMessage key={index} message={msg.content}/>
        )
      )}

      {isSending && (
        <Skeleton visible={isSending} height={36} bdrs={'12px 12px 12px 4px'}/>
      )}

      {isError && (
        <BotMessage message={'An error occurred while processing your request. Please try again later.'}/>
      )}
    </Stack>
  )
}

type ChatInputProps = {
  onSendInput: (message: string) => void
  isSending?: boolean
  isSuccess?: boolean
}

const ChatInput = ({
  onSendInput,
  isSending = false,
  isSuccess = false,
}: ChatInputProps) => {
  const theme = useMantineTheme()
  const [value, setValue] = useState('')

  const canSend = !!value.trim() && !isSending

  useEffect(() => {
    if (isSuccess) {
      setValue('')
    }
  }, [isSuccess])

  return (
    <Group
      p={'md'}
      justify={'space-between'}
      style={{
        borderTop: `1px solid ${theme.colors.gray[3]}`,
      }}
    >
      <Input
        placeholder="Type your message..."
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        rightSectionPointerEvents="all"
        radius="lg"
        disabled={isSending}
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
          if (!canSend) return
          onSendInput(value)
        }}
        size="sm"
        radius="xl"
        p={'0 1rem'}
        loading={isSending}
        disabled={!canSend}
        style={{
          backgroundColor: theme.colors.secondary[6],
          color: theme.white,
        }}
      >
        Send
      </Button>
    </Group>
  )
}

const DropZoneIndicator = () => (
  <Affix position={{ top: '12%', left: '50%' }} w={"8rem"} h={"8rem"}
    className="rounded-full border-2 border-dashed border-blue-500 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
    style={{
      zIndex: 999,
     }}
  >
    <Stack align="center" justify="center" h="100%">
      <Text fw={600} size="md" ta ="center">Drop to hide chatbot</Text>
    </Stack>
  </Affix>
)

export default Chatbot
