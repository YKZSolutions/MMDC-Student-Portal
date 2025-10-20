import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks'
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
 * Includes both immediate and debounced setters for search state.
 *
 * @param {RouteApi<TId, TRouter>} route - The route API instance returned by `Route.useRoute()`.
 * @param {number} [debounceMs=200] - Delay in milliseconds for debounced search updates.
 *
 * @returns
 * Object containing:
 * - `search`: Current search parameters.
 * - `navigate`: Underlying navigate function.
 * - `setSearch`: Immediately updates search parameters.
 * - `setDebouncedSearch`: Debounced version of `setSearch`.
 * - `clearSearch`: Removes all or selected search parameters.
 */
export const useSearchState = <
  const TId,
  TRouter extends AnyRouter = RegisteredRouter,
>(
  route: RouteApi<TId, TRouter>,
  debounceMs: number = 200,
) => {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  type Search = typeof search

  const [query, setQuery] = useState<Search>(search)

  const [debouncedSearch] = useDebouncedValue(search, debounceMs)

  const debouncedNavigate = useDebouncedCallback(
    (next: Partial<Search>, replace: boolean = false) => {
      navigate({
        search: ((prev: Search) => ({ ...prev, ...next })) as any,
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
    setQuery((prev) => ({ ...prev, ...next }))

    navigate({
      search: ((prev: Search) => ({ ...prev, ...next })) as any,
      replace,
    })
  }

  /**
   * Debounced version of `setSearch`. Updates search parameters after the debounce delay.
   *
   * @param {Partial<Search>} next - Search parameters to merge.
   * @param {boolean} [replace=false] - Whether to replace the current history entry.
   */
  const setDebouncedSearch = (
    next: Partial<Search>,
    replace: boolean = false,
  ) => {
    setQuery((prev) => ({ ...prev, ...next }))

    debouncedNavigate(next, replace)
  }

  /**
   * Clears specified search parameters or all if no keys are provided.
   *
   * @param {(keyof Search)[]} [keys] - Keys to clear. Clears all if omitted.
   */
  const clearSearch = (keys?: (keyof Search)[]) => {
    if (!keys) {
      navigate({ search: {} as Partial<Search> } as any)
      return
    }

    navigate({
      search: ((prev: Search) => {
        const copy = { ...prev }
        keys.forEach((k) => delete copy[k])
        return copy
      }) as any,
    })
  }

  return { search: query, navigate, setSearch, debouncedSearch, setDebouncedSearch, clearSearch }
}
