import React, { useState } from 'react'
import { Flex, TextInput } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'

const SearchComponent = <T extends object>({
  data,
  setData,
  identifiers,
  placeholder,
}: {
  data: T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  identifiers: (keyof T)[],
  placeholder: string
}) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filteredData = data.filter((value: any) =>
      identifiers.some((identifier) =>
        value[identifier].toLowerCase().includes(query.toLowerCase()),
      ),
    )
    setData(filteredData)
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