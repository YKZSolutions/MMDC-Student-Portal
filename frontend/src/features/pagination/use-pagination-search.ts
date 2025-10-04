import { type RouteApi, type UseNavigateResult } from '@tanstack/react-router'
import type { PaginationSearch } from './search-validation'
import { useDebouncedCallback } from '@mantine/hooks'

type PaginationNavigate = {
  (opts: { search: (prev: PaginationSearch) => PaginationSearch }): void
} & Omit<UseNavigateResult<string>, ''>

export const usePaginationSearch = <T>(route: RouteApi<T>) => {
  const pagination = route.useSearch()
  const navigate = route.useNavigate() as unknown as PaginationNavigate

  const searchQuery = (search: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search,
      }),
    })
  }

  const debouncedSearch = useDebouncedCallback(async (search: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: search !== '' ? search : undefined,
      }),
    })
  }, 300)

  const changePage = (page: number, totalPage: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: prev.page && prev.page < totalPage ? page + 1 : prev.page,
      }),
    })
  }

  const handlePage = (page: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page: page,
      }),
    })
  }

  return {
    pagination,
    searchQuery,
    debouncedSearch,
    changePage,
    handlePage,
  }
}
