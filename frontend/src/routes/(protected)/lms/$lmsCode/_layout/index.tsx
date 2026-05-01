import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/lms/$lmsCode/_layout/')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/lms/$lmsCode/overview',
      params: { lmsCode: params.lmsCode },
    })
  },
})
