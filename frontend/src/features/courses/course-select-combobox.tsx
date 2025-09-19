import {
    courseSectionControllerFindAllCourseSectionsOptions,
    courseSectionControllerFindOneCourseSectionByIdOptions,
} from '@/integrations/api/client/@tanstack/react-query.gen'
import {
    ActionIcon,
    Box,
    Combobox,
    Group,
    InputBase,
    Text,
    TextInput,
    useCombobox,
} from '@mantine/core'
import { readLocalStorageValue } from '@mantine/hooks'
import { IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { Fragment } from 'react'

export type SectionOption = { id: string; label: string }

export default function CourseSelectCombobox() {
  const { courseCode } = useParams({
    strict: false,
  })

  const enrollmentPeriodId = readLocalStorageValue<string | null>({
    key: 'enrollmentPeriodId',
  })

  const { data: section } = useSuspenseQuery(
    courseSectionControllerFindOneCourseSectionByIdOptions({
      path: {
        sectionId: courseCode!,
      },
    }),
  )

  const { data } = useSuspenseQuery(
    courseSectionControllerFindAllCourseSectionsOptions({
      path: {
        enrollmentId: enrollmentPeriodId!,
      },
    }),
  )

  const courses = data.courseSections

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const handleOptionSubmit = (value: string) => {
    try {
      const parsed = JSON.parse(value) as SectionOption
      //   onChange?.(parsed.id)
    } catch (e) {
      // fallback: value is id
      //   onChange?.(value)
    }
    combobox.closeDropdown()
  }

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    // onChange?.(null as any)
  }

  return (
    <Combobox store={combobox} onOptionSubmit={(v) => handleOptionSubmit(v)}>
      <Combobox.Target>
        {section.id ? (
          <InputBase
            component="button"
            type="button"
            pointer
            radius="md"
            onClick={() => combobox.openDropdown()}
            rightSection={
              <ActionIcon
                size="sm"
                variant="subtle"
                radius="xl"
                onClick={handleReset}
              >
                <IconX size={14} />
              </ActionIcon>
            }
          >
            <Box style={{ textAlign: 'left' }}>
              <Text size="sm" fw={600} truncate>
                {section.courseOffering.course.courseCode} -{' '}
                {section.courseOffering.course.name}
              </Text>
            </Box>
          </InputBase>
        ) : (
          <TextInput
            placeholder="Select course"
            radius="md"
            onClick={() => combobox.openDropdown()}
            onFocus={() => combobox.openDropdown()}
          />
        )}
      </Combobox.Target>

      <Combobox.Dropdown className="max-h-56 overflow-y-auto">
        <Combobox.Options>
          {courses.length === 0 && (
            <Group align="center" justify="center" p="md">
              <Text size="sm" c="dimmed">
                No options
              </Text>
            </Group>
          )}
          {courses.map((course) => (
            <Combobox.Option key={course.id} value={JSON.stringify(course)}>
              <Fragment>
                <Text size="sm">{course.name}</Text>
              </Fragment>
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
