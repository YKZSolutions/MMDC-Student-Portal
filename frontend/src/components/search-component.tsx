import React, { useState } from 'react'
import { TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

// Use a type alias for the identifier path
type IdentifierPath = string[]

type SearchComponentProps<T extends object> = {
  data: T[]
  identifiers: (keyof T | IdentifierPath)[]
  placeholder: string
  onFilter: (filteredData: T[]) => void
}

const SearchComponent = <T extends object>({
  data,
  identifiers,
  placeholder,
  onFilter,
}: SearchComponentProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('')

  const getNestedValues = (obj: any, path: string[]): any[] => {
    return path.reduce(
      (values, key) => {
        if (!values.length) return []

        return values.flatMap((val) => {
          if (val == null) return []
          const next = val[key]

          if (Array.isArray(next)) return next
          if (next !== undefined) return [next]
          return []
        })
      },
      [obj],
    )
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query) {
      onFilter(data)
      return
    }

    const filteredData = data.filter((item: T) => {
      return identifiers.some((identifier) => {
        let values: any[]

        if (Array.isArray(identifier)) {
          values = getNestedValues(item, identifier)
        } else {
          values = [item[identifier]]
        }

        // Match if *any* string value contains the query
        return values.some(
          (value) =>
            typeof value === 'string' &&
            value.toLowerCase().includes(query.toLowerCase()),
        )
      })
    })

    onFilter(filteredData)
  }

  return (
    <TextInput
      placeholder={placeholder}
      radius="md"
      leftSection={<IconSearch size="75%" />}
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
    />
  )
}

export default SearchComponent
