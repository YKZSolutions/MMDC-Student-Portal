import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Popover,
  Stack,
  Text,
  Textarea,
  useMantineTheme,
  Transition,
} from '@mantine/core'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import Draggable from 'react-draggable'
import {
  IconMessageChatbot,
  IconSend,
  IconX,
  IconTrash,
} from '@tabler/icons-react'
import { useMutation } from '@tanstack/react-query'
import { chatbotControllerPromptMutation } from '@/integrations/api/client/@tanstack/react-query.gen.ts'
import type { Turn } from '@/integrations/api/client'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useResizeObserver, useMediaQuery } from '@mantine/hooks'

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
  const [fabRef] = useResizeObserver()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const DROP_ZONE_RADIUS = isMobile ? 120 : 150
  const DROPZONE_X = window.innerWidth / 2
  const DROPZONE_Y = window.innerHeight / 6
  const MAX_MESSAGES = 20

  const [messages, setMessages] = useState<Turn[]>([])
  const [errorMessage, setErrorMessage] = useState<string>('')
  const {
    mutateAsync: create,
    isPending,
    isError,
    isSuccess,
  } = useMutation(chatbotControllerPromptMutation())

  // Simple state for dragging
  const [isDragging, setIsDragging] = useState(false)
  const dragEndedRef = useRef(false)

  // Simple initial position calculation
  const getInitialPosition = useCallback(() => {
    if (isMobile) {
      return { x: 10, y: window.innerHeight - 100 }
    }
    return {
      x: window.innerWidth - 200,
      y: window.innerHeight - 100,
    }
  }, [isMobile])

  // Set the initial position
  const [position, setPosition] = useState(getInitialPosition)

  // Reset position when FAB is shown again after being hidden
  useEffect(() => {
    if (!isChatbotFabHidden) {
      setPosition(getInitialPosition())
    }
  }, [isChatbotFabHidden, getInitialPosition])

  // Update position when the window resizes
  useEffect(() => {
    const handleResize = () => {
      if (!isChatbotFabHidden) {
        setPosition(getInitialPosition())
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isChatbotFabHidden, getInitialPosition])

  // Reset when FAB gets hidden
  useEffect(() => {
    if (isChatbotFabHidden) {
      setChatbotOpen(false)
    }
  }, [isChatbotFabHidden, setChatbotOpen])

  const addMessage = async (userInput: string) => {
    setErrorMessage('')
    const userMessage = { role: 'user' as const, content: userInput }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    try {
      const res = await create({
        body: {
          question: userInput,
          sessionHistory: messages,
        },
      })


      setMessages((prev) =>
        [...prev, { role: 'model' as const, content: res.response }].slice(
          -MAX_MESSAGES,
        ),
      )
    } catch (error) {
      setErrorMessage(
        'Unable to get a response. Please check your connection and try again.',
      )
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle the mouse down for dragging on non-mobile devices
    if (!isMobile) {
      // Close the chat window immediately on mouse down
      setChatbotOpen(false)
    }
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragStop = (e: any, data: any) => {
    setIsDragging(false)
    setPosition({ x: data.x, y: data.y })

    const distance = Math.hypot(data.x - DROPZONE_X, data.y - DROPZONE_Y)

    if (distance < DROP_ZONE_RADIUS) {
      dragEndedRef.current = true
      setChatbotFabHidden(true)
      setChatbotOpen(false)

      setTimeout(() => {
        dragEndedRef.current = false
      }, 100)
    }
  }

  const handleFabClick = (e: React.MouseEvent) => {
    // Prevent click if we just ended a drag
    if (dragEndedRef.current) {
      e.preventDefault()
      return
    }
    setChatbotOpen(!isChatbotOpen)
  }

  const resetChat = () => {
    setMessages([])
    setErrorMessage('')
  }

  // Get popover width based on screen size
  const getPopoverWidth = () => {
    if (isMobile) return window.innerWidth - 20
    if (isTablet) return 380
    return 420
  }

  // Don't render anything if FAB is hidden
  if (isChatbotFabHidden) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 2000,
      }}
      role="complementary"
      aria-label="Student support chatbot"
    >
      <Transition mounted={isDragging} transition="fade" duration={200}>
        {(styles) => (
          <div style={styles}>
            <DropZoneIndicator
              dropZoneX={DROPZONE_X}
              dropZoneY={DROPZONE_Y}
              dropZoneRadius={DROP_ZONE_RADIUS}
            />
          </div>
        )}
      </Transition>

      <Draggable
        nodeRef={nodeRef}
        position={position}
        bounds="parent"
        onStart={handleDragStart}
        onStop={handleDragStop}
        handle=".chatbot-drag-handle"
        disabled={isMobile}
      >
        <div
          ref={nodeRef}
          style={{
            position: 'fixed',
            cursor: isDragging ? 'grabbing' : isMobile ? 'pointer' : 'grab',
            userSelect: 'none',
            pointerEvents: 'auto',
            zIndex: 2001,
          }}
        >
          <Popover
            opened={isChatbotOpen}
            onClose={() => setChatbotOpen(false)}
            position={
              isMobile
                ? 'top'
                : position.y < window.innerHeight / 2
                  ? 'bottom'
                  : 'top'
            }
            width={getPopoverWidth()}
            withArrow
            shadow="xl"
            radius="lg"
            closeOnClickOutside={!isMobile}
            trapFocus={isChatbotOpen}
            transitionProps={{
              transition: 'pop-top-left',
              duration: 200,
            }}
          >
            <Popover.Target>
              <Button
                ref={fabRef}
                className="chatbot-drag-handle"
                onClick={handleFabClick}
                onMouseDown={handleMouseDown}
                variant="filled"
                color="secondary"
                size={isMobile ? 'md' : 'lg'}
                radius="xl"
                leftSection={<IconMessageChatbot size={isMobile ? 20 : 24} />}
                aria-label="Open student support chat"
                aria-expanded={isChatbotOpen}
                style={{
                  boxShadow: theme.shadows.lg,
                  transform: isDragging ? 'scale(1.05)' : 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  minWidth: isMobile ? 'auto' : 140,
                  pointerEvents: 'auto',
                }}
              >
                <Text size={isMobile ? 'sm' : 'lg'} fw={500}>
                  {'Ask AI'}
                </Text>
              </Button>
            </Popover.Target>
            <Popover.Dropdown p={0} h={isMobile ? '70vh' : '75vh'}>
              <Stack h="100%" gap={0}>
                <ChatHeader
                  onClose={() => setChatbotOpen(false)}
                  onReset={resetChat}
                  hasMessages={messages.length > 0}
                />
                <ChatMessages
                  messages={messages}
                  isSending={isPending}
                  isError={isError}
                  errorMessage={errorMessage}
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

const ChatHeader = ({
  onClose,
  onReset,
  hasMessages,
}: {
  onClose: () => void
  onReset: () => void
  hasMessages: boolean
}) => {
  const theme = useMantineTheme()

  return (
    <Group
      p="sm"
      justify="space-between"
      bg={theme.colors.secondary[6]}
      style={{
        borderBottom: `1px solid ${theme.colors.gray[2]}`,
        borderRadius: '8px 8px 0 0',
      }}
    >
      <Flex align="center" gap="xs">
        <Text fw={600} c={theme.white} size="md">
          Student Support
        </Text>
      </Flex>
      <Group gap="xs">
        {hasMessages && (
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={onReset}
            aria-label="Reset conversation"
            title="Start new conversation"
          >
            <IconTrash size={16} color={theme.white} />
          </ActionIcon>
        )}
        <ActionIcon
          variant="subtle"
          size="sm"
          onClick={onClose}
          aria-label="Close chat"
        >
          <IconX size={18} color={theme.white} />
        </ActionIcon>
      </Group>
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
          fontWeight: 600,
          lineHeight: 1.3,
          color: theme.colors.dark[7],
        }}
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h4
        style={{
          margin: '8px 0 6px 0',
          fontSize: '0.875rem',
          fontWeight: 600,
          lineHeight: 1.35,
          color: theme.colors.dark[7],
        }}
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h5
        style={{
          margin: '8px 0 6px 0',
          fontSize: '0.85rem',
          fontWeight: 600,
          lineHeight: 1.4,
          color: theme.colors.dark[7],
        }}
        {...props}
      />
    ),
    p: ({ node, ...props }) => (
      <p
        style={{
          margin: '6px 0',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: theme.colors.dark[7],
        }}
        {...props}
      />
    ),
    ul: ({
      node,
      ...props
    }: {
      node?: any
      className?: string
      children?: React.ReactNode
    }) => (
      <ul
        style={{
          margin: '6px 0',
          paddingLeft: 24,
          lineHeight: 1.6,
          listStyleType: 'disc',
        }}
        {...props}
      />
    ),
    ol: ({
      node,
      ...props
    }: {
      node?: any
      className?: string
      children?: React.ReactNode
    }) => (
      <ol
        style={{
          margin: '6px 0',
          paddingLeft: 24,
          lineHeight: 1.6,
          listStyleType: 'decimal',
        }}
        {...props}
      />
    ),
    li: ({ node, ...props }) => (
      <li
        style={{
          margin: '4px 0',
          fontSize: '0.875rem',
          display: 'list-item',
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
          color: theme.colors.blue[6],
          textDecoration: 'underline',
          fontWeight: 500,
          transition: 'color 0.2s ease',
        }}
        {...props}
      />
    ),
    strong: ({ node, ...props }) => (
      <strong
        style={{
          fontWeight: 600,
          color: theme.colors.dark[8],
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
            background: theme.colors.gray[1],
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: '0.85em',
            color: theme.colors.blue[7],
            fontFamily: 'monospace',
          }}
          {...props}
        />
      ) : (
        <pre
          style={{
            background: theme.colors.gray[1],
            padding: 12,
            borderRadius: 6,
            overflowX: 'auto',
            margin: '8px 0',
            fontSize: '0.8em',
            color: theme.colors.gray[8],
            border: `1px solid ${theme.colors.gray[3]}`,
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
          margin: '12px 0',
        }}
      />
    ),
    // GFM-specific components
    table: ({ node, ...props }) => (
      <div style={{ overflowX: 'auto', margin: '12px 0' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.8rem',
          }}
          {...props}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        style={{
          border: `1px solid ${theme.colors.gray[3]}`,
          padding: '8px 12px',
          backgroundColor: theme.colors.gray[0],
          fontWeight: 600,
          textAlign: 'left',
        }}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        style={{
          border: `1px solid ${theme.colors.gray[3]}`,
          padding: '8px 12px',
          backgroundColor: theme.white,
        }}
        {...props}
      />
    ),
    del: ({ node, ...props }) => (
      <del
        style={{
          textDecoration: 'line-through',
          color: theme.colors.gray[6],
        }}
        {...props}
      />
    ),
    input: ({ node, checked, type, ...props }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            style={{
              marginRight: '6px',
              transform: 'scale(0.9)',
            }}
            {...props}
          />
        )
      }
      return <input type={type} {...props} />
    },
  }

  return (
    <Box
      p="sm"
      style={{
        borderRadius: '12px 12px 12px 4px',
        background: theme.colors.gray[0],
        maxWidth: '85%',
        alignSelf: 'flex-start',
        border: `1px solid ${theme.colors.gray[2]}`,
        boxShadow: theme.shadows.xs,
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {message}
      </ReactMarkdown>
    </Box>
  )
}

const UserMessage = ({ message }: { message: string }) => {
  const theme = useMantineTheme()
  return (
    <Box
      p="sm"
      style={{
        borderRadius: '12px 12px 4px 12px',
        background: theme.colors.secondary[6],
        maxWidth: '85%',
        alignSelf: 'flex-end',
        boxShadow: theme.shadows.xs,
      }}
    >
      <Text size="sm" c={theme.white} style={{ lineHeight: 1.5 }}>
        {message}
      </Text>
    </Box>
  )
}

const TypingIndicator = () => {
  const theme = useMantineTheme()

  const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.colors.gray[5],
    animation: 'typing 1.4s infinite ease-in-out',
  }

  return (
    <Box
      p="sm"
      style={{
        borderRadius: '12px 12px 12px 4px',
        background: theme.colors.gray[0],
        maxWidth: '85%',
        alignSelf: 'flex-start',
        border: `1px solid ${theme.colors.gray[2]}`,
      }}
    >
      <Flex align="center" gap="sm">
        <Flex gap={4}>
          <Box style={{ ...dotStyle, animationDelay: '0s' }} />
          <Box style={{ ...dotStyle, animationDelay: '0.2s' }} />
          <Box style={{ ...dotStyle, animationDelay: '0.4s' }} />
        </Flex>
        <Text size="xs" c="dimmed">
          Thinking...
        </Text>
      </Flex>
      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.4;
            }
            30% {
              transform: translateY(-8px);
              opacity: 1;
            }
          }
        `}
      </style>
    </Box>
  )
}

type ChatMessagesProps = {
  messages: Turn[]
  isSending?: boolean
  isError?: boolean
  errorMessage?: string
}

const ChatMessages = ({
  messages,
  isSending = false,
  isError = false,
  errorMessage = '',
}: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom()
    }
  }, [messages, isSending, shouldAutoScroll])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50
    setShouldAutoScroll(isNearBottom)
  }

  return (
    <Stack
      ref={messagesContainerRef}
      gap="md"
      p="md"
      flex={1}
      onScroll={handleScroll}
      style={{
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <BotMessage
        message={`### 👋 Hi there! I'm your student support assistant. How can I help you today?\n\nI can assist you with:\n\n- Enrollment and Billing information\n- Student Portal use and navigation\n- Course & Progress information\n- Booking Appointments and Scheduling\n- General questions\n\n`}
      />
      {messages.map((msg, index) =>
        msg.role === 'user' ? (
          <UserMessage key={index} message={msg.content} />
        ) : (
          <BotMessage key={index} message={msg.content} />
        ),
      )}

      {isSending && <TypingIndicator />}

      {isError && errorMessage && <BotMessage message={`⚠️ ${errorMessage}`} />}

      <div ref={messagesEndRef} />
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = !!value.trim() && !isSending

  useEffect(() => {
    if (isSuccess) {
      setValue('')
      textareaRef.current?.focus()
    }
  }, [isSuccess])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if (!canSend) return
    onSendInput(value)
  }

  return (
    <Flex
      direction="column"
      p="sm"
      style={{
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        background: theme.colors.gray[0],
      }}
    >
      <Flex
        direction="column"
        bg={theme.white}
        w="100%"
        style={{
          border: `1px solid ${theme.colors.gray[3]}`,
          borderRadius: theme.radius.md,
          transition: 'border-color 0.2s ease',
        }}
      >
        <Textarea
          ref={textareaRef}
          placeholder="Ask me anything..."
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          autosize
          minRows={1}
          maxRows={3}
          disabled={isSending}
          variant="unstyled"
          px="sm"
          pt="xs"
          aria-label="Type your message"
          styles={{
            input: {
              resize: 'none',
              overflowY: 'auto',
              lineHeight: 1.5,
              fontSize: '0.875rem',
            },
          }}
        />

        <Flex align="center" justify="space-between" px="sm" py="xs">
          <Text size="xs" c="dimmed">
            Press Enter to send
          </Text>
          <ActionIcon
            onClick={handleSend}
            size="md"
            radius="xl"
            loading={isSending}
            disabled={!canSend}
            variant="filled"
            color={canSend ? 'secondary' : 'gray'}
            aria-label="Send message"
            style={{
              transition: 'all 0.2s ease',
              cursor: canSend ? 'pointer' : 'not-allowed',
            }}
          >
            <IconSend size={14} />
          </ActionIcon>
        </Flex>
      </Flex>
    </Flex>
  )
}

const DropZoneIndicator = ({
  dropZoneRadius = 150,
  dropZoneX = window.innerWidth / 2,
  dropZoneY = window.innerHeight / 6,
}) => {
  const theme = useMantineTheme()

  return (
    <div
      style={{
        position: 'fixed',
        top: dropZoneY - dropZoneRadius / 2,
        left: dropZoneX - dropZoneRadius / 2,
        width: dropZoneRadius,
        height: dropZoneRadius,
        borderRadius: '50%',
        border: `3px dashed ${theme.colors.red[5]}`,
        background: `${theme.colors.red[0]}`,
        zIndex: 1999,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.9,
        transition: 'all 0.3s ease',
      }}
    >
      <Stack align="center" gap="xs">
        <IconX size={32} color={theme.colors.red[6]} />
        <Text fw={600} size="sm" ta="center" c={theme.colors.red[7]}>
          Drop to hide
        </Text>
      </Stack>
    </div>
  )
}

export default Chatbot
