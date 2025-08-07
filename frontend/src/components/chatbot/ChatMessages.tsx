import { Text, useMantineTheme } from '@mantine/core'
import { useState } from 'react'

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

type Message = {
  role: 'user' | 'bot'
  content: string
}


const ChatMessages = ({messages}: {messages: Message[]}) => {
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


export default ChatMessages