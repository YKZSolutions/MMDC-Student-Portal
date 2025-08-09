import {
    Button,
    Card,
    Group,
    Image,
    Modal,
    rem,
    Stack,
    Text,
    Transition,
} from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useState, type ReactNode } from 'react'

const ewallets = [
  {
    name: 'Maya',
    value: 'paymaya',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Maya_logo.svg',
  },
  {
    name: 'GCash',
    value: 'gcash',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/27/Gcash_logo.png',
  },
]

export default function EwalletSelectionModal({
  children,
  paymentOpened,
  paymentClose,
  handleProceed,
}: {
  children: ReactNode
  paymentOpened: boolean
  paymentClose: () => void
  handleProceed: (selectedWallet: string | null) => void
}) {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  return (
    <>
      {children}
      <Modal
        opened={paymentOpened}
        onClose={() => {
          paymentClose()
        }}
        title={<Text fw={500}>Select E-wallet</Text>}
        centered
        radius="md"
        size="md"
        padding={'lg'}
      >
        <Stack gap="md">
          {ewallets.map((wallet) => (
            <Card
              key={wallet.value}
              // shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              onClick={() => setSelectedWallet(wallet.value)}
              style={{
                cursor: 'pointer',
                backgroundColor:
                  selectedWallet === wallet.value
                    ? 'var(--mantine-color-gray-0)'
                    : undefined,
              }}
            >
              <Group>
                <Image
                  src={wallet.logo}
                  alt={wallet.value}
                  h={rem(40)}
                  w={rem(40)}
                  fit="contain"
                />
                <Text fw={500} c={'gray.9'}>
                  {wallet.name}
                </Text>
                <Transition
                  mounted={selectedWallet === wallet.value}
                  transition={'fade'}
                  duration={250}
                  timingFunction="ease"
                >
                  {(styles) => (
                    <IconCheck
                      style={{
                        ...styles,
                        marginLeft: 'auto',
                      }}
                      color="green"
                    />
                  )}
                </Transition>
              </Group>
            </Card>
          ))}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={() => paymentClose()}>
              Cancel
            </Button>
            <Button
              disabled={!selectedWallet}
              onClick={() => handleProceed(selectedWallet)}
            >
              Proceed
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
