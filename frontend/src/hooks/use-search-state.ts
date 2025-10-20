import { useDebouncedCallback } from '@mantine/hooks'
import type {
  AnyRouter,
  RegisteredRouter,
  RouteApi,
} from '@tanstack/react-router'
import { useState } from 'react'

/**
 * A custom hook that simplifies reading, updating, and clearing
 * URL search parameters when using TanStack Router.
 *
 * Maintains a local state that syncs with URL search params.
 * Provides immediate local updates with debounced URL navigation.
 *
 * @param {RouteApi<TId, TRouter>} route - The route API instance returned by `Route.useRoute()`.
 * @param {Partial<Search>} [defaultValues] - Default values for search parameters.
 * @param {number} [debounceMs=200] - Delay in milliseconds for debounced URL updates.
 *
 * @returns
 * Object containing:
 * - `search`: Current URL search parameters (alias for searchParam).
 * - `searchParam`: Current URL search parameters.
 * - `query`: Local state for search parameters (immediately updated).
 * - `navigate`: Underlying navigate function.
 * - `setSearch`: Updates URL search parameters immediately.
 * - `setQuery`: Updates local state and triggers debounced URL navigation.
 * - `clearSearch`: Removes all or selected search parameters.
 */
export const useSearchState = <
  const TId,
  TRouter extends AnyRouter = RegisteredRouter,
>(
  route: RouteApi<TId, TRouter>,
  defaultValues?: Partial<any>,
  debounceMs: number = 200,
) => {
  const searchParam = route.useSearch()
  const navigate = route.useNavigate()
  type Search = typeof searchParam

  const queryDefaultValues = {
    ...defaultValues,
    ...Object.fromEntries(
      Object.entries(searchParam).filter(([_, v]) => v !== undefined),
    ),
  } as Search

  const [query, setQueryState] = useState<Search>(queryDefaultValues)

  const handleNavigate = useDebouncedCallback(
    (next: Partial<Search>, replace: boolean = false) => {
      navigate({
        search: ((prev: Search) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(next).map(([k, v]) => [
              k,
              v === '' || v === null ? undefined : v,
            ]),
          ),
        })) as any,
        replace,
      })
    },
    debounceMs,
  )

  /**
   * Immediately updates search parameters by merging with existing values.
   *
   * @param {Partial<Search>} next - Search parameters to merge.
   * @param {boolean} [replace=false] - Whether to replace the current history entry.
   */
  const setSearch = (next: Partial<Search>, replace: boolean = false) => {
    navigate({
      search: ((prev: Search) => ({ ...prev, ...next })) as any,
      replace,
    })
  }

  /**
   * Updates local query state immediately and triggers debounced URL navigation.
   *
   * @param {Partial<Search> | ((prev: Search) => Partial<Search>)} next - New search parameters or updater function.
   * @param {boolean} [replace=false] - Whether to replace the current history entry.
   */
  const setQuery = (
    next: Partial<Search> | ((prev: Search) => Partial<Search>),
    replace: boolean = false,
  ) => {
    const updates = typeof next === 'function' ? next(query) : next

    setQueryState((prev) => ({
      ...prev,
      ...updates,
    }))

    handleNavigate(updates, replace)
  }

  /**
   * Clears specified search parameters or all if no keys are provided.
   *
   * @param {(keyof Search)[]} [keys] - Keys to clear. Clears all if omitted.
   */
  const clearSearch = (keys?: (keyof Search)[]) => {
    if (!keys) {
      setQueryState(defaultValues as Search)
      navigate({ search: {} as Partial<Search> } as any)
      return
    }

    const clearedValues = Object.fromEntries(
      keys.map((k) => [k, defaultValues?.[k] ?? null]),
    ) as Partial<Search>

    setQueryState((prev) => ({
      ...prev,
      ...clearedValues,
    }))

    navigate({
      search: ((prev: Search) => {
        const copy = { ...prev }
        keys.forEach((k) => delete copy[k])
        return copy
      }) as any,
    })
  }

  return {
    search: searchParam,
    searchParam,
    query,
    navigate,
    setSearch,
    setQuery,
    clearSearch,
  }
}
