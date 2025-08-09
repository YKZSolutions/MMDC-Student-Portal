import { Center, Loader as MantineLoader } from '@mantine/core'

export function Loader() {
  return (
    <Center h="100vh">
      <MantineLoader size="lg" variant="dots" />
    </Center>
  )
}
