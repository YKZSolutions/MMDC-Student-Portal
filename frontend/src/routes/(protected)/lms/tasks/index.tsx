import { createFileRoute } from '@tanstack/react-router'
import TasksPage from '@/pages/student/tasks/tasks.page'
import { Loader } from '@/components/loader-component'
import { z } from 'zod'

const tasksStateSearchSchema = z.object({
  tab: z
    .enum(['all', 'upcoming', 'submitted', 'graded'])
    .optional()
    .default('all'),
  search: z.string().optional(),
  sortBy: z
    .enum(['dueDate', 'title', 'course', 'status'])
    .optional()
    .default('dueDate'),
  sortDirection: z.enum(['asc', 'desc']).optional().default('asc'),
  courseId: z.string().uuid().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
})

export type TasksSearchParams = z.infer<typeof tasksStateSearchSchema>

export const Route = createFileRoute('/(protected)/lms/tasks/')({
  component: RouteComponent,
  pendingComponent: Loader,
  validateSearch: tasksStateSearchSchema,
})

function RouteComponent() {
  return <TasksPage />
}
