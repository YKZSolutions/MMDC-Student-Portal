import { type ReactNode } from 'react'
import NoItemFound from './no-item-found'
import { IconInbox } from '@tabler/icons-react'

interface EmptyRendererProps<T> {
  /**
   * The array of items to render
   */
  items: T[] | null | undefined

  /**
   * Render function for each item in the array
   */
  children: (item: T, index: number) => ReactNode

  /**
   * Custom empty state component (optional)
   */
  emptyState?: ReactNode

  /**
   * Simple empty message (alternative to emptyState)
   */
  emptyMessage?: string

  /**
   * Empty state title
   */
  emptyTitle?: string

  /**
   * Empty state subtitle/description
   */
  emptySubtitle?: string

  /**
   * Icon for the empty state
   */
  emptyIcon?: ReactNode

  /**
   * Loading state
   */
  isLoading?: boolean

  /**
   * Loading fallback component
   */
  loadingFallback?: ReactNode

  /**
   * Wrapper component for the list (optional)
   */
  wrapper?: (children: ReactNode) => ReactNode
}

/**
 * A component that handles rendering of arrays with built-in empty state support
 *
 * @example
 * // Basic usage
 * <EmptyRenderer items={users} emptyMessage="No users found">
 *   {(user) => <UserCard key={user.id} user={user} />}
 * </EmptyRenderer>
 *
 * @example
 * // With custom empty state
 * <EmptyRenderer
 *   items={courses}
 *   emptyTitle="No courses available"
 *   emptySubtitle="Start by creating your first course"
 *   emptyIcon={<IconBook size={36} />}
 * >
 *   {(course) => <CourseCard key={course.id} course={course} />}
 * </EmptyRenderer>
 *
 * @example
 * // With wrapper
 * <EmptyRenderer
 *   items={students}
 *   wrapper={(children) => <Stack gap="md">{children}</Stack>}
 * >
 *   {(student) => <StudentCard key={student.id} student={student} />}
 * </EmptyRenderer>
 */
export function EmptyRenderer<T>({
  items,
  children,
  emptyState,
  emptyMessage,
  emptyTitle = 'No items found',
  emptySubtitle,
  emptyIcon,
  isLoading = false,
  loadingFallback = <>Loading...</>,
  wrapper,
}: EmptyRendererProps<T>) {
  // Handle loading state
  if (isLoading) {
    return <>{loadingFallback}</>
  }

  // Handle empty/null/undefined arrays
  if (!items || items.length === 0) {
    // Use custom empty state if provided
    if (emptyState) {
      return <>{emptyState}</>
    }

    // Use simple message if provided
    if (emptyMessage) {
      return (
        <NoItemFound
          icon={emptyIcon || <IconInbox size={36} stroke={1.5} />}
          title={emptyMessage}
        />
      )
    }

    // Use detailed empty state
    return (
      <NoItemFound
        icon={emptyIcon || <IconInbox size={36} stroke={1.5} />}
        title={emptyTitle}
        subtitle={emptySubtitle}
      />
    )
  }

  // Render items
  const renderedItems = items.map((item, index) => children(item, index))

  // Wrap items if wrapper is provided
  if (wrapper) {
    return <>{wrapper(renderedItems)}</>
  }

  return <>{renderedItems}</>
}

/**
 * Hook version for more flexible usage
 */
export function useEmptyRenderer<T>(
  items: T[] | null | undefined,
  options?: {
    emptyMessage?: string
    emptyTitle?: string
    emptySubtitle?: string
    emptyIcon?: ReactNode
  },
) {
  const isEmpty = !items || items.length === 0

  const renderEmpty = () => {
    if (options?.emptyMessage) {
      return (
        <NoItemFound
          icon={options.emptyIcon || <IconInbox size={36} stroke={1.5} />}
          title={options.emptyMessage}
        />
      )
    }

    return (
      <NoItemFound
        icon={options?.emptyIcon || <IconInbox size={36} stroke={1.5} />}
        title={options?.emptyTitle || 'No items found'}
        subtitle={options?.emptySubtitle}
      />
    )
  }

  return {
    isEmpty,
    items: items || [],
    renderEmpty,
  }
}

export default EmptyRenderer
