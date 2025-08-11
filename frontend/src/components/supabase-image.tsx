import { supabase } from '@/integrations/supabase/supabase-client'
import { Image, type ImageProps } from '@mantine/core'

interface SupabaseImageProps extends ImageProps {
  bucket: string
  path: string
  imageType: 'png' | 'jpg' | 'jpeg'
}

function SupabaseImage({
  src,
  bucket,
  path,
  imageType,
  ...props
}: SupabaseImageProps) {
  const imageUrl = supabase.storage
    .from(bucket)
    .getPublicUrl(`${path}.${imageType}`).data.publicUrl

  return <Image src={src || imageUrl} {...props} />
}

export default SupabaseImage
