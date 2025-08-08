import { Text } from '@mantine/core'

const DropZoneIndicator = () => (
  <div
    className="fixed top-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-32 h-32 rounded-full border-2 border-dashed border-blue-500 bg-blue-100 hover:bg-blue-200 transition-colors duration-300"
    style={{
        zIndex: 999,
        pointerEvents: 'none' }}
  >
    <Text className="text-center text-blue-600">Drop to hide chatbot</Text>
  </div>
)

export default DropZoneIndicator
