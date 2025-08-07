import { Button, Container, Group, Modal, Text, Transition } from '@mantine/core'
import { IconMessageChatbot } from '@tabler/icons-react'
import { useState } from 'react'

export function Chatbot() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <Button
        leftIcon={<IconMessageChatbot size={20} />}
        onClick={() => setOpened(true)}
        style={{ position: 'fixed', bottom: 20, right: 20 }}
        variant="outline"
      >
        Chatbot
      </Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        overlayOpacity={0.55}
        size="lg"
        title="Chatbot"
      >
        <Container size="md" p="md">
          <Text>
            This is a simple chatbot window. You can add your own chatbot
            functionality here.
          </Text>
        </Container>
      </Modal>
    </>
  )
}