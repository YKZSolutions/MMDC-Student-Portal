import { Button, useMantineTheme } from '@mantine/core'
import { Input, CloseButton } from '@mantine/core';
import { useState } from 'react';

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

export default ChatInput
