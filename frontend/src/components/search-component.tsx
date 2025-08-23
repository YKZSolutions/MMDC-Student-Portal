import React, { useState } from 'react';
import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

// Use a type alias for the identifier path
type IdentifierPath = string[];

type SearchComponentProps<T extends object> = {
  data: T[];
  identifiers: (keyof T | IdentifierPath)[];
  placeholder: string;
  onFilter: (filteredData: T[]) => void;
};

const SearchComponent = <T extends object>({
  data,
  identifiers,
  placeholder,
  onFilter,
}: SearchComponentProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to get a nested value from an object
  const getNestedValue = (obj: any, path: string[]): any => {
    return path.reduce((currentObj, key) => (currentObj && currentObj[key] !== undefined ? currentObj[key] : null), obj);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      onFilter(data);
      return;
    }

    const filteredData = data.filter((item: T) => {
      return identifiers.some((identifier) => {
        let value: any;
        if (Array.isArray(identifier)) {
          // It's a nested identifier, so use the helper function
          value = getNestedValue(item, identifier);
        } else {
          // It's a top-level identifier
          value = item[identifier];
        }

        // Only search on string values that are not null or undefined
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase());
        }
        return false;
      });
    });

    onFilter(filteredData);
  };

  return (
    <TextInput
      placeholder={placeholder}
      radius="md"
      leftSection={<IconSearch size="75%" />}
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
};

export default SearchComponent;