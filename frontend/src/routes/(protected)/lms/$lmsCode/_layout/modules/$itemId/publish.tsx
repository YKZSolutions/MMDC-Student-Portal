import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(protected)/lms/$lmsCode/_layout/modules/$itemId/publish',
)({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/lms/$lmsCode/modules/$itemId/edit',
      params: { lmsCode: params.lmsCode, itemId: params.itemId },
    })
  },
})
