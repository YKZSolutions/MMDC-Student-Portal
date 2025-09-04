import {
  Affix,
  Box,
  Button,
  Flex,
  Group,
  Popover,
  Skeleton,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
} from '@mantine/core'
import React, { useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable'
import { IconMessageChatbot, IconSend, IconX } from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { chatbotControllerPromptMutation } from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import type { Turn } from '@/integrations/api/client'
import ReactMarkdown, { type Components } from 'react-markdown'
import { useResizeObserver } from '@mantine/hooks'

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
  const nodeRef = useRef<HTMLDivElement>(null) // Ref to the draggable node
  const [fabRef, { width: fabWidth, height: fabHeight }] = useResizeObserver()

  const DROP_ZONE_RADIUS = 150
  const DROPZONE_X = window.innerWidth / 2
  const DROPZONE_Y = window.innerHeight / 6
  const MAX_MESSAGES = 10

  const [messages, setMessages] = useState<Turn[]>([])
  const {
    mutateAsync: create,
    isPending,
    isError,
    isSuccess,
  } = useMutation(chatbotControllerPromptMutation())

  // Compute "show" snap position (bottom-right)
  const getShowPosition = () => {
    return {
      x: window.innerWidth - fabWidth - 20,
      y: window.innerHeight - fabHeight - 20,
    }
  }

  const clampPosition = (pos: { x: number; y: number }) => {
    return {
      x: Math.min(
        Math.max(pos.x, 0),
        window.innerWidth - fabWidth - 20, // keep inside screen
      ),
      y: Math.min(Math.max(pos.y, 0), window.innerHeight - fabHeight - 20),
    }
  }

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  // Initial positioning only when showing
  useEffect(() => {
    if (!isChatbotFabHidden) {
      setPosition(getShowPosition())
    }
  }, [isChatbotFabHidden, fabWidth, fabHeight])

  // Clamp on resize
  useEffect(() => {
    const updatePosition = () => {
      if (!isChatbotFabHidden) {
        setPosition((prev) => clampPosition(prev))
      }
    }

    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [isChatbotFabHidden, fabWidth, fabHeight])

  const addMessage = async (userInput: string) => {
    // Add the user's message to the state
    const userMessage = { role: 'user' as const, content: userInput }

    // Get the current messages including the new user message
    const updatedMessages = [...messages, userMessage]

    // Update the UI immediately with the user's message
    setMessages(updatedMessages)

    const res = await create({
      body: {
        question: userInput,
        sessionHistory: messages, // Send all previous messages
      },
    })

    // Add the bot's response to the messages
    setMessages((prev) =>
      [...prev, { role: 'model' as const, content: res.response }].slice(
        -MAX_MESSAGES,
      ),
    ) // Keep only the last 5 interactions (10 messages: 5 user + 5 bot)
  }

  const handleDragStop = (e: any, data: any) => {
    setIsDragging(false)

    // Calculate the distance between the draggable's current position and the center of the screen
    const distance = Math.hypot(data.x - DROPZONE_X, data.y - DROPZONE_Y)

    // Check if the draggable is within the drop zone
    if (distance < DROP_ZONE_RADIUS) {
      // Hide the chatbot if the user has dragged it to the drop zone
      setChatbotFabHidden(true)
      setChatbotOpen(false)
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2000,
      }}
    >
      {isDragging && (
        <DropZoneIndicator
          dropZoneX={DROPZONE_X}
          dropZoneY={DROPZONE_Y}
          dropZoneRadius={DROP_ZONE_RADIUS}
        />
      )}
      <Draggable
        nodeRef={nodeRef}
        position={position}
        bounds="parent"
        onDrag={(e, data) => {
          setIsDragging(true)
          setChatbotOpen(false)
          // Update the position state with Draggable's data
          setPosition({ x: data.x, y: data.y })
        }}
        onStart={undefined} //Disables click listener
        onStop={handleDragStop}
        handle=".chatbot-drag-handle"
      >
        <div
          ref={nodeRef}
          style={{
            position: 'fixed',
            cursor: isDragging ? 'grabbing' : 'grab',
            pointerEvents: isChatbotFabHidden ? 'none' : 'auto',
            userSelect: 'none',
            visibility: isChatbotFabHidden ? 'hidden' : 'visible',
          }}
        >
          <Popover
            opened={isChatbotOpen}
            onClose={() => setChatbotOpen(false)}
            position={position.y < window.innerHeight / 2 ? 'bottom' : 'top'}
            width={350}
            withArrow
            shadow="lg"
            radius="md"
          >
            <Popover.Target>
              <Button
                ref={fabRef}
                className="chatbot-drag-handle"
                onClick={() => setChatbotOpen(!isChatbotOpen)}
                variant="filled"
                color={'secondary'}
                size="lg"
                radius="xl"
                leftSection={<IconMessageChatbot size={24} />}
                style={{
                  boxShadow: theme.shadows.sm,
                  transform: isDragging ? 'scale(1.05)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <Text unselectable={'on'} size={'lg'} fw={500}>
                  Chat with us
                </Text>
              </Button>
            </Popover.Target>
            <Popover.Dropdown p={0} h={'65vh'}>
              <Stack h={'100%'}>
                <ChatHeader onClose={() => setChatbotOpen(false)} />{' '}
                <ChatMessages
                  messages={messages}
                  isSending={isPending}
                  isError={isError}
                />
                <ChatInput
                  onSendInput={addMessage}
                  isSending={isPending}
                  isSuccess={isSuccess}
                />
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </div>
      </Draggable>
    </div>
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
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
      }}
    >
      <Text fw={600} c={theme.white} size="md">
        Chat Support
      </Text>
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

const BotMessage = ({ message }: { message: string }) => {
  const theme = useMantineTheme()

  const components: Components = {
    h1: ({ node, ...props }) => (
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '1rem',
          fontWeight: 700,
          lineHeight: 1.3,
          color: theme.black,
        }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h4
        style={{
          margin: '8px 0 6px 0',
          fontSize: '0.875rem',
          fontWeight: 700,
          lineHeight: 1.35,
          color: theme.black,
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h5
        style={{
          margin: '8px 0 6px 0',
          fontSize: '0.85rem',
          fontWeight: 700,
          lineHeight: 1.4,
          color: theme.black,
        }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p
        style={{
          margin: '6px 0',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          color: theme.black,
        }}
        {...props}
      />
    ),
    ul: ({
      node,
      ordered,
      ...props
    }: {
      node?: any
      ordered?: boolean
      className?: string
      children?: React.ReactNode
    }) => (
      <ul
        style={{
          margin: '6px 0',
          paddingLeft: 24,
          lineHeight: 1.5,
        }}
        {...props}
      />
    ),
    ol: ({
      node,
      ordered,
      ...props
    }: {
      node?: any
      ordered?: boolean
      className?: string
      children?: React.ReactNode
    }) => (
      <ol
        style={{
          margin: '6px 0',
          paddingLeft: 24,
          lineHeight: 1.5,
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li
        style={{
          margin: '4px 0',
          fontSize: '0.875rem',
        }}
        {...props}
      />
    ),
    a: ({ node, href, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: theme.colors.blue[5],
          textDecoration: 'underline',
          fontWeight: 500,
          transition: 'color 0.2s ease',
        }}
        className="hover:text-blue-600"
        {...props}
      />
    ),
    strong: ({ node, ...props }) => (
      <strong
        style={{
          fontWeight: 700,
        }}
        {...props}
      />
    ),
    em: ({ node, ...props }) => (
      <em
        style={{
          fontStyle: 'italic',
        }}
        {...props}
      />
    ),
    code: ({
      node,
      inline,
      ...props
    }: {
      node?: any
      inline?: boolean
      className?: string
      children?: React.ReactNode
    }) =>
      inline ? (
        <code
          style={{
            background: theme.colors.gray[0],
            padding: '0 3px',
            borderRadius: 4,
            fontSize: '0.75em',
            color: theme.colors.blue[5],
          }}
          {...props}
        />
      ) : (
        <pre
          style={{
            background: theme.colors.gray[0],
            padding: 12,
            borderRadius: 6,
            overflowX: 'auto',
            margin: '8px 0',
            fontSize: '0.75em',
            color: theme.colors.gray[7],
          }}
        >
          <code {...props} />
        </pre>
      ),
    hr: () => (
      <hr
        style={{
          border: 'none',
          borderTop: `1px solid ${theme.colors.gray[3]}`,
          margin: '16px 0',
        }}
      />
    ),
  }

  return (
    <Box
      p={'md'}
      bdrs={'12px 12px 12px 4px'}
      bg={theme.colors.gray[1]}
      maw="95%"
      style={{
        alignSelf: 'flex-start',
      }}
    >
      <ReactMarkdown components={components}>{message}</ReactMarkdown>
    </Box>
  )
}

const UserMessage = ({ message }: { message: string }) => {
  const theme = useMantineTheme()
  return (
    <Box
      p={'md'}
      bdrs={'12px 12px 4px 12px'}
      bg={theme.colors.gray[1]}
      maw="90%"
      style={{
        alignSelf: 'flex-end',
      }}
    >
      <Text size="sm">{message}</Text>
    </Box>
  )
}

type ChatMessagesProps = {
  messages: Turn[]
  isSending?: boolean
  isError?: boolean
}

const ChatMessages = ({
  messages,
  isSending = false,
  isError = false,
}: ChatMessagesProps) => {
  return (
    <Stack
      gap="sm"
      p={'lg'}
      flex={1}
      style={{
        overflowY: 'auto',
      }}
    >
      <BotMessage message={'Hello! How can I help you today?'} />

      {messages.map((msg, index) =>
        msg.role === 'user' ? (
          <UserMessage key={index} message={msg.content} />
        ) : (
          <BotMessage key={index} message={msg.content} />
        ),
      )}

      {isSending && (
        <Skeleton visible={isSending} height={36} bdrs={'12px 12px 12px 4px'} />
      )}

      {isError && (
        <BotMessage
          message={
            'An error occurred while processing your request. Please try again later.'
          }
        />
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault()
      onSendInput(value)
    }
  }

  return (
    <Flex
      p={'md'}
      style={{
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        position: 'relative',
      }}
    >
      <Textarea
        placeholder="Type your message..."
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
        rightSectionPointerEvents="all"
        radius="lg"
        w={'100%'}
        autosize={true}
        minRows={1}
        maxRows={3}
        disabled={isSending}
        styles={{
          input: {
            paddingRight: '2.5rem',
            resize: 'none',
            overflow: 'hidden',
            '&:focus': {
              overflow: 'auto',
            },
          },
        }}
        rightSection={
          <Flex
            align={'flex-end'}
            justify={'flex-end'}
            h={'100%'}
            p={'0.25rem'}
          >
            <Button
              onClick={() => {
                if (!canSend) return
                onSendInput(value)
              }}
              size="xs"
              radius="xl"
              loading={isSending}
              hidden={!canSend}
              bg="transparent"
            >
              <IconSend color={theme.colors.primary[0]} />
            </Button>
          </Flex>
        }
      />
    </Flex>
  )
}

const DropZoneIndicator = ({
  dropZoneRadius = 150,
  dropZoneX = window.innerWidth / 2,
  dropZoneY = window.innerHeight / 6,
}) => (
  <Affix
    position={{ top: dropZoneY, left: dropZoneX }}
    w={dropZoneRadius}
    h={dropZoneRadius}
    className="rounded-full border-2 border-dashed border-blue-500 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
    style={{
      zIndex: 2000,
      cursor: 'grabbing',
      opacity: 0.7,
    }}
  >
    <Stack align="center" justify="center" h="100%">
      <Text fw={600} size="md" ta="center">
        Drop to hide chatbot
      </Text>
    </Stack>
  </Affix>
)

export default Chatbot
