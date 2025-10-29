import {
  lmsControllerFindModuleTreeQueryKey,
  lmsSectionControllerPublishSectionMutation,
  lmsSectionControllerRemoveMutation,
  lmsSectionControllerUnpublishSectionMutation,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import { getContext } from '@/integrations/tanstack-query/root-provider'
import { useAppMutation } from '@/integrations/tanstack-query/useAppMutation'
import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useParams } from '@tanstack/react-router'

const { queryClient } = getContext()

export function useSectionActions() {
  const { lmsCode } = useParams({ strict: false })

  const moduleTreeKey = lmsControllerFindModuleTreeQueryKey({
    path: { id: lmsCode || '' },
  })

  const invalidateModuleTree = async () => {
    await queryClient.cancelQueries({ queryKey: moduleTreeKey })
    await queryClient.invalidateQueries({ queryKey: moduleTreeKey })
  }

  const deleteSubsection = useAppMutation(
    lmsSectionControllerRemoveMutation,
    {
      loading: {
        title: 'Deleting Subsection',
        message: 'Deleting subsection — please wait',
      },
      success: {
        title: 'Subsection Deleted',
        message: 'Subsection was deleted successfully',
      },
      error: {
        title: 'Failed to Delete Subsection',
        message: 'There was an error while deleting the subsection.',
      },
    },
    {
      onSuccess: async () => {
        await invalidateModuleTree()
      },
    },
  )

  const publishSubsection = useAppMutation(
    lmsSectionControllerPublishSectionMutation,
    {
      loading: { title: 'Publishing Section', message: 'Publishing...' },
      success: { title: 'Section Published', message: 'Section published.' },
      error: { title: 'Failed to Publish', message: 'Try again.' },
    },
    {
      onSuccess: async () => {
        await invalidateModuleTree()
      },
    },
  )

  const unpublishSubsection = useAppMutation(
    lmsSectionControllerUnpublishSectionMutation,
    {
      loading: { title: 'Unpublishing', message: 'Unpublishing...' },
      success: { title: 'Section Unpublished', message: 'Section hidden.' },
      error: { title: 'Failed to Unpublish', message: 'Try again.' },
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

  const handleDelete = (sectionId: string) =>
    confirm(
      'Delete Module Section',
      'Are you sure you want to delete this section? This cannot be undone.',
      async () => {
        await deleteSubsection.mutateAsync({
          path: { moduleSectionId: sectionId },
          query: { directDelete: true },
        })
      },
      'Delete',
      'red',
    )

  const handlePublish = (sectionId: string) =>
    confirm(
      'Publish Module Section',
      'Are you sure you want to publish this module section?',
      async () => {
        await publishSubsection.mutateAsync({ path: { id: sectionId } })
      },
      'Publish',
      'green.9',
    )

  const handleUnpublish = (sectionId: string) =>
    confirm(
      'Unpublish Module Section',
      'Are you sure you want to unpublish this section?',
      async () => {
        await unpublishSubsection.mutateAsync({ path: { id: sectionId } })
      },
      'Unpublish',
      'red',
    )

  return {
    handleDelete,
    handlePublish,
    handleUnpublish,
  }
}
