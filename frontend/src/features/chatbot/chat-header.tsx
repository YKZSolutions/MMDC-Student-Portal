import { Button, Text, useMantineTheme } from '@mantine/core'
import { IconX } from '@tabler/icons-react'

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

export default ChatHeader
