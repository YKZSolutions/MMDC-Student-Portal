import {
  lmsContentControllerPublishMutation,
  lmsContentControllerRemoveMutation,
  lmsContentControllerUnpublishMutation,
  lmsControllerFindModuleTreeQueryKey,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useNavigate, useParams } from '@tanstack/react-router'

const { queryClient } = getContext()

export function useContentActions() {
  const { lmsCode } = useParams({ strict: false })
  const navigate = useNavigate()

  const moduleTreeKey = lmsControllerFindModuleTreeQueryKey({
    path: { id: lmsCode || '' },
  })

  const invalidateModuleTree = async () => {
    await queryClient.cancelQueries({ queryKey: moduleTreeKey })
    await queryClient.invalidateQueries({ queryKey: moduleTreeKey })
  }

  const deleteContent = useAppMutation(
    lmsContentControllerRemoveMutation,
    {
      loading: {
        title: 'Deleting Module Content',
        message: 'Deleting module content — please wait',
      },
      success: {
        title: 'Module Content Deleted',
        message: 'Module content was deleted successfully',
      },
      error: {
        title: 'Failed to Delete Module Content',
        message: 'There was an error while deleting the module content.',
      },
    },
    { onSuccess: invalidateModuleTree },
  )

  const publishContent = useAppMutation(
    lmsContentControllerPublishMutation,
    {
      loading: {
        title: 'Publishing Module Content',
        message: 'Publishing module content — please wait',
      },
      success: {
        title: 'Module Content Published',
        message: 'Module content was published successfully',
      },
      error: {
        title: 'Failed to Publish Module Content',
        message: 'There was an error while publishing the module content.',
      },
    },
    { onSuccess: invalidateModuleTree },
  )

  const unpublishContent = useAppMutation(
    lmsContentControllerUnpublishMutation,
    {
      loading: {
        title: 'Unpublishing Module Content',
        message: 'Unpublishing module content — please wait',
      },
      success: {
        title: 'Module Content Unpublished',
        message: 'Module content was unpublished successfully',
      },
      error: {
        title: 'Failed to Unpublish Module Content',
        message: 'There was an error while unpublishing the module content.',
      },
    },
    { onSuccess: invalidateModuleTree },
  )

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    confirmLabel = 'Confirm',
    color = 'blue',
  ) =>
    modals.openConfirmModal({
      title: <Text fw={600}>{title}</Text>,
      children: <Text size="sm">{message}</Text>,
      centered: true,
      labels: { confirm: confirmLabel, cancel: 'Cancel' },
      confirmProps: { color },
      onConfirm,
    })

  const handleDelete = (contentId: string) =>
    confirm(
      'Delete Module Content',
      'Are you sure you want to delete this module content? This cannot be undone.',
      async () => {
        await deleteContent.mutateAsync({
          path: { moduleContentId: contentId },
          query: { directDelete: true },
        })
      },
      'Delete',
      'red',
    )

  const handlePublish = (contentId: string) =>
    confirm(
      'Publish Module Content',
      'Are you sure you want to publish this module content?',
      async () => {
        await publishContent.mutateAsync({
          path: { moduleContentId: contentId },
        })
      },
      'Publish',
      'green.9',
    )

  const handleUnpublish = (contentId: string) =>
    confirm(
      'Unpublish Module Content',
      'Are you sure you want to unpublish this module content? This will hide it from students.',
      async () => {
        await unpublishContent.mutateAsync({
          path: { moduleContentId: contentId },
        })
      },
      'Unpublish',
      'red',
    )

  const handleEdit = (contentId: string) => {
    navigate({
      from: '/lms/$lmsCode/modules',
      to: '$itemId/edit',
      params: { itemId: contentId },
      search: { id: contentId },
    })
  }

  return {
    handleDelete,
    handlePublish,
    handleUnpublish,
    handleEdit,
  }
}
