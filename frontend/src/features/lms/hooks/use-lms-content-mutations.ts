import type { Block } from '@blocknote/core'
import {
  lmsContentControllerFindOneQueryKey,
  lmsContentControllerPublishMutation,
  lmsContentControllerRemoveMutation,
  lmsContentControllerUnpublishMutation,
  lmsContentControllerUpdateMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'

const { queryClient } = getContext()

interface UseLMSContentMutationsOptions {
  moduleContentId: string
  onDeleteSuccess?: () => void
}

export function useLMSContentMutations({
  moduleContentId,
  onDeleteSuccess,
}: UseLMSContentMutationsOptions) {
  // Update mutation
  const { mutateAsync: updateContent, isPending: isUpdating } = useAppMutation(
    lmsContentControllerUpdateMutation,
    {
      loading: {
        message: 'Saving changes...',
        title: 'Updating Content',
      },
      success: {
        message: 'Content updated successfully',
        title: 'Content Updated',
      },
      error: {
        title: 'Failed to update content',
        message: 'Please try again later',
      },
    },
    {
      onSuccess: async () => {
        const moduleContentKey = lmsContentControllerFindOneQueryKey({
          path: { moduleContentId },
        })
        await queryClient.invalidateQueries({ queryKey: moduleContentKey })
      },
    },
  )

  // Publish mutation
  const { mutateAsync: publishContent, isPending: isPublishing } =
    useAppMutation(
      lmsContentControllerPublishMutation,
      {
        loading: {
          message: 'Publishing changes...',
          title: 'Publishing Content',
        },
        success: {
          message: 'Content published successfully',
          title: 'Content Published',
        },
        error: {
          title: 'Failed to publish content',
          message: 'Please try again later',
        },
      },
      {
        onSuccess: async () => {
          const moduleContentKey = lmsContentControllerFindOneQueryKey({
            path: { moduleContentId },
          })
          await queryClient.invalidateQueries({ queryKey: moduleContentKey })
        },
      },
    )

  // Unpublish mutation
  const { mutateAsync: unpublishContent, isPending: isUnpublishing } =
    useAppMutation(
      lmsContentControllerUnpublishMutation,
      {
        loading: {
          message: 'Unpublishing changes...',
          title: 'Unpublishing Content',
        },
        success: {
          message: 'Content unpublished successfully',
          title: 'Content Unpublished',
        },
        error: {
          title: 'Failed to unpublish content',
          message: 'Please try again later',
        },
      },
      {
        onSuccess: async () => {
          const moduleContentKey = lmsContentControllerFindOneQueryKey({
            path: { moduleContentId },
          })
          await queryClient.invalidateQueries({ queryKey: moduleContentKey })
        },
      },
    )

  // Delete mutation
  const { mutateAsync: deleteContent, isPending: isDeleting } = useAppMutation(
    lmsContentControllerRemoveMutation,
    {
      loading: {
        message: 'Deleting content...',
        title: 'Deleting Content',
      },
      success: {
        message: 'Content deleted successfully',
        title: 'Content Deleted',
      },
      error: {
        title: 'Failed to delete content',
        message: 'Please try again later',
      },
    },
    {
      onSuccess: () => {
        onDeleteSuccess?.()
      },
    },
  )

  // Helper functions
  const handleSave = async (content: Block[], title?: string) => {
    await updateContent({
      path: { moduleContentId },
      body: {
        content,
        ...(title && { title }),
      },
    })
  }

  const handleUpdateTitle = async (title: string) => {
    await updateContent({
      path: { moduleContentId },
      body: { title },
    })
  }

  const handlePublish = async () => {
    await publishContent({
      path: { moduleContentId },
    })
  }

  const handleUnpublish = async () => {
    await unpublishContent({
      path: { moduleContentId },
    })
  }

  const handleDelete = async () => {
    await deleteContent({
      path: { moduleContentId },
    })
  }

  return {
    // Mutation functions
    handleSave,
    handleUpdateTitle,
    handlePublish,
    handleUnpublish,
    handleDelete,

    // Loading states
    isUpdating,
    isPublishing,
    isUnpublishing,
    isDeleting,
    isSaving: isUpdating || isPublishing || isUnpublishing,
  }
}
