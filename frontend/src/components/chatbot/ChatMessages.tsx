import { Text, useMantineTheme } from '@mantine/core'
import { theme } from '@/integrations/mantine/mantine-theme.ts'


const BotMessage = ({message}) =>{
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

const UserMessage = ({message}) =>{
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

const ChatMessages = () => {
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
      <BotMessage message="Hello! How can I help you today?" />

      <Text size="xs" c="dimmed" ta="center" mt="md">
        Start typing to continue the conversation...
      </Text>
      
      <UserMessage message="I need help with my account." />
    </div>
  )
}

export default ChatMessages