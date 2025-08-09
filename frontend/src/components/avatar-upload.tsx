import { useRef, useState } from 'react'
import { Avatar, ActionIcon, Stack } from '@mantine/core'
import { IconCamera } from '@tabler/icons-react'

interface AvatarUploadProps {
  size?: number
  radius?: number | string
  initialImage?: string
  file?: File | null
  onImageUpload?: (file: File) => void
}

export function AvatarUpload({
  size = 100,
  radius = 'xl',
  initialImage,
  file,
  onImageUpload,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string | undefined>(initialImage)

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      onImageUpload?.(file)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Stack
        className="relative"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <Avatar
          src={(file && URL.createObjectURL(file)) || preview}
          radius={radius}
          size={size}
          className="cursor-pointer shadow-lg"
          onClick={handleAvatarClick}
        />
        <ActionIcon
          size="sm"
          radius="xl"
          variant="filled"
          color="blue"
          onClick={handleAvatarClick}
          className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4"
        >
          <IconCamera size="12" />
        </ActionIcon>
      </Stack>
    </>
  )
}
