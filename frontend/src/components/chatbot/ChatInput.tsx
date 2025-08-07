import { Button, useMantineTheme } from '@mantine/core'

const ChatInput = () => {
  const theme = useMantineTheme()

  return (
    <div
      style={{
        padding: '16px 20px',
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          flex: 1,
          padding: '10px 14px',
          border: `1px solid ${theme.colors.gray[4]}`,
          borderRadius: 20,
          backgroundColor: theme.colors.gray[0],
          fontSize: 14,
          color: theme.colors.gray[6],
          cursor: 'text',
        }}
      >
        Type your message...
      </div>
      <Button size="sm" radius="xl" style={{
        padding: '0 16px',
        backgroundColor: theme.colors.secondary[6],
        color: theme.white,
      }}>
        Send
      </Button>
    </div>
  )
}

export default ChatInput
