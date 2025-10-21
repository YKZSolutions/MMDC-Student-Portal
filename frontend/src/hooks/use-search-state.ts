import { useDebouncedCallback, useDidUpdate } from '@mantine/hooks'
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
  const searchParam = route.useSearch()
  const navigate = route.useNavigate()
  type Search = typeof searchParam

  // This holds the current search state, so navigation updates won't break
  // the displayed values while typing.
  const [query, setQuery] = useState<Search>(searchParam)

  // FIX: This should ensure a change in one component updates others
  useDidUpdate(() => setQuery(searchParam), [searchParam])

  const updateNavigate = (next: Partial<Search>, replace = false) => {
    navigate({
      search: ((prev: Search) => ({ ...prev, ...next })) as any,
      replace,
    })
  }

  const debouncedNavigate = useDebouncedCallback(updateNavigate, debounceMs)

  /**
   * Immediately updates search parameters by merging with existing values.
   * Can be used for UI elements that require instant feedback.
   *
   * @param {Partial<Search>} next - Search parameters to merge.
   * @param {boolean} [replace=false] - Whether to replace the current history entry.
   */
  const setSearch = (next: Partial<Search>, replace: boolean = false) => {
    setQuery((prev) => ({ ...prev, ...next }))
    updateNavigate(next, replace)
  }

  /**
   * Debounced version of `setSearch`. Updates search parameters after the debounce delay.
   * Useful for inputs where frequent changes occur, like text fields.
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

  const handleSearch = (search: Partial<Search['search']>) => {
    setDebouncedSearch({
      search: search || undefined,
      page: undefined,
    } as Partial<Search>)
  }

  const handlePage = (page: Partial<Search['page']>) => {
    setDebouncedSearch({
      page: page == 1 ? undefined : page,
    } as Partial<Search>)
  }

  /**
   * Clears specified search parameters or all if no keys are provided.
   *
   * @param {(keyof Search)[]} [keys] - Keys to clear. Clears all if omitted.
   */
  const clearSearchParam = (keys?: (keyof Search)[]) => {
    if (!keys) {
      setQuery({} as Search)
      navigate({ search: {} as Partial<Search> } as any)
      return
    }

    const remover = (prev: Search) => {
      const copy = { ...prev }
      keys.forEach((k) => delete copy[k])
      return copy
    }

    setQuery(remover)
    navigate({ search: remover } as any)
  }

  return {
    search: query, // Use the local state to avoid flicker while typing
    navigate,
    setSearch,
    setDebouncedSearch,
    clearSearchParam,
    handleSearch,
    handlePage,
  }
}
