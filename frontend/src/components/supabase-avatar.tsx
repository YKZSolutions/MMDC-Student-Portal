import { supabase } from '@/integrations/supabase/supabase-client'
import { Avatar, type AvatarProps, type ImageProps } from '@mantine/core'

interface SupabaseAvatarProps extends AvatarProps {
  bucket: string
  path: string
  imageType: 'png' | 'jpg' | 'jpeg'
}

function SupabaseAvatar({
  src,
  bucket,
  path,
  imageType,
  ...props
}: SupabaseAvatarProps) {
  const imageUrl = supabase.storage
    .from(bucket)
    .getPublicUrl(`${path}.${imageType}`).data.publicUrl

  return <Avatar src={imageUrl} {...props} />
}

export default SupabaseAvatar
