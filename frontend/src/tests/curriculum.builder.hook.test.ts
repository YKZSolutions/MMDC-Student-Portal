import { renderHook, act } from '@testing-library/react'
import {
  useCurriculumBuilder,
  type CurriculumCourse,
} from '@/features/curriculum/hooks/curriculum.builder.hook'
import { describe, expect, test } from 'vitest'

// Mock sample courses for testing
const mockCourses: CurriculumCourse[] = [
  {
    id: '1',
    code: 'MO-IT0125',
    name: 'Introduction to Computing',
    type: 'Major',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 1,
  },
  {
    id: '2',
    code: 'MO-GE125',
    name: 'Communication Skills',
    type: 'General',
    department: 'GE',
    units: 3,
    year: 1,
    semester: 1,
  },
  {
    id: '3',
    code: 'MO-IT126',
    name: 'Programming Fundamentals',
    type: 'Major',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 2,
  },
]

describe('useCurriculumBuilder', () => {
  // Basic Functionality Tests

  test('initializes with empty state when no courses provided', () => {
    const { result } = renderHook(() => useCurriculumBuilder())

    expect(result.current.currentCourses).toEqual([])
    expect(result.current.structure).toHaveLength(4) // Default 4 years

    // Check the default structure has all semesters
    result.current.structure.forEach((year) => {
      expect(year.semesters).toContain(1)
      expect(year.semesters).toContain(2)
      expect(year.semesters).toContain(3)
    })

    // All containers should be empty
    Object.values(result.current.courses).forEach((courseArray) => {
      expect(courseArray).toEqual([])
    })
  })

  test('initializes with provided courses', () => {
    const { result } = renderHook(() => useCurriculumBuilder(mockCourses))

    expect(result.current.currentCourses).toHaveLength(3)
    expect(result.current.courses['1-1']).toHaveLength(2) // Both courses in semester 1
    expect(result.current.courses['1-2']).toHaveLength(1) // One course in semester 2

    // Check the course objects are mapped correctly
    const semester1Courses = result.current.courses['1-1']
    expect(semester1Courses.find((c) => c.code === 'MO-IT0125')).toBeDefined()
    expect(semester1Courses.find((c) => c.code === 'MO-GE125')).toBeDefined()
  })

  // Testing Actions

  test('adds a new year', () => {
    const { result } = renderHook(() => useCurriculumBuilder())

    act(() => {
      result.current.dispatch({ type: 'ADD_YEAR' })
    })

    // Should add year 5 with 3 semesters
    expect(result.current.structure).toContainEqual({
      year: 5,
      semesters: [1, 2, 3],
    })

    // New containers should exist and be empty
    expect(result.current.courses['5-1']).toEqual([])
    expect(result.current.courses['5-2']).toEqual([])
    expect(result.current.courses['5-3']).toEqual([])
  })

  test('deletes a year and renumbers higher years', () => {
    const testCourses = [
      ...mockCourses,
      {
        id: '4',
        code: 'MO-IT225',
        name: 'Data Structures',
        type: 'Major',
        department: 'IT',
        units: 3,
        year: 2,
        semester: 1,
      },
      {
        id: '5',
        code: 'MO-IT325',
        name: 'Database Systems',
        type: 'Major',
        department: 'IT',
        units: 4,
        year: 3,
        semester: 1,
      },
    ]

    const { result } = renderHook(() => useCurriculumBuilder(testCourses))

    act(() => {
      result.current.dispatch({ type: 'DEL_YEAR', payload: { year: 2 } })
    })

    // Year 2 should be gone
    expect(result.current.structure.find((y) => y.year === 2)).toBeUndefined()

    // Year 3 should now be year 2
    const newYear2 = result.current.structure.find((y) => y.year === 2)
    expect(newYear2).toBeDefined()

    // Courses should be updated with new year numbers
    const formerYear3Course = result.current.currentCourses.find(
      (c) => c.code === 'MO-IT325',
    )
    expect(formerYear3Course?.year).toBe(2)

    // Year 2 course should be removed
    expect(
      result.current.currentCourses.find((c) => c.code === 'MO-IT225'),
    ).toBeUndefined()
  })

  test('adds a semester to a year', () => {
    const { result } = renderHook(() => useCurriculumBuilder())

    act(() => {
      result.current.dispatch({ type: 'ADD_SEM', payload: { year: 1 } })
    })

    // Year 1 should now have a 4th semester
    const year1 = result.current.structure.find((y) => y.year === 1)
    expect(year1?.semesters).toContain(4)

    // Container for the new semester should exist
    expect(result.current.courses['1-4']).toBeDefined()
    expect(result.current.courses['1-4']).toEqual([])
  })

  test('deletes a semester and renumbers higher semesters', () => {
    const { result } = renderHook(() => useCurriculumBuilder(mockCourses))

    act(() => {
      // Add a course to semester 3
      result.current.setCurrentCourses((draft) => {
        draft.push({
          id: '4',
          code: 'MO-IT127',
          name: 'Web Development',
          type: 'Major',
          department: 'IT',
          units: 3,
          year: 1,
          semester: 3,
        })
      })

      result.current.dispatch({
        type: 'ADD_COURSE_DRAG',
        payload: { key: '1-3', course: 'MO-IT127' },
      })

      // Now delete semester 2
      result.current.dispatch({
        type: 'DEL_SEM',
        payload: { year: 1, sem: 2 },
      })
    })

    // Semester 2 should be gone
    const year1 = result.current.structure.find((y) => y.year === 1)
    expect(year1?.semesters).not.toContain(2)

    // Semester 3 should now be semester 2
    expect(year1?.semesters).toContain(2)

    // Course from semester 3 should now be in semester 2
    const movedCourse = result.current.currentCourses.find(
      (c) => c.code === 'MO-IT127',
    )
    expect(movedCourse?.semester).toBe(2)

    // Container '1-3' should no longer exist, and '1-2' should have the moved course
    expect(result.current.courses['1-3']).toBeUndefined()
    expect(result.current.courses['1-2']).toContainEqual(
      expect.objectContaining({ code: 'MO-IT127' }),
    )
  })

  test('adds a course via drag and drop', () => {
    const { result } = renderHook(() => useCurriculumBuilder())
    const newCourse = {
      id: '1',
      code: 'MO-IT225',
      name: 'Data Structures',
      type: 'Major',
      department: 'IT',
      units: 3,
      year: 0, // Will be set by the drag operation
      semester: 0, // Will be set by the drag operation
    }

    act(() => {
      // Add course to currentCourses
      result.current.setCurrentCourses((draft) => {
        draft.push(newCourse)
      })

      // Drag to year 2, semester 1
      result.current.dispatch({
        type: 'ADD_COURSE_DRAG',
        payload: { key: '2-1', course: 'MO-IT225' },
      })

      // Update course metadata
      result.current.setCurrentCourses((draft) => {
        const course = draft.find((c) => c.code === 'MO-IT225')
        if (course) {
          course.year = 2
          course.semester = 1
        }
      })
    })

    // Course should be in the correct container
    expect(result.current.courses['2-1']).toHaveLength(1)
    expect(result.current.courses['2-1'][0].code).toBe('MO-IT225')

    // Course metadata should be updated
    const updatedCourse = result.current.currentCourses.find(
      (c) => c.code === 'MO-IT225',
    )
    expect(updatedCourse?.year).toBe(2)
    expect(updatedCourse?.semester).toBe(1)
  })

  test('deletes a course', () => {
    const { result } = renderHook(() => useCurriculumBuilder(mockCourses))

    act(() => {
      // Delete the first course
      result.current.dispatch({
        type: 'DEL_COURSE',
        payload: { year: 1, sem: 1, course: 'MO-IT0125' },
      })

      // Remove from currentCourses too
      result.current.setCurrentCourses((draft) =>
        draft.filter((c) => c.code !== 'MO-IT0125'),
      )
    })

    // Course should be removed from the container
    expect(result.current.courses['1-1']).toHaveLength(1)
    expect(result.current.courses['1-1'][0].code).toBe('MO-GE125')

    // Course should be removed from currentCourses
    expect(result.current.currentCourses).toHaveLength(2)
    expect(
      result.current.currentCourses.find((c) => c.code === 'MO-IT0125'),
    ).toBeUndefined()
  })

  // Edge Cases

  test('handles switching between different curricula', () => {
    const otherCourses: CurriculumCourse[] = [
      {
        id: '10',
        code: 'MO-BA101',
        name: 'Introduction to Business',
        type: 'Major',
        department: 'BA',
        units: 3,
        year: 1,
        semester: 1,
      },
    ]

    const { result, rerender } = renderHook(
      ({ courses }) => useCurriculumBuilder(courses),
      { initialProps: { courses: mockCourses } },
    )

    // First render with mockCourses
    expect(result.current.currentCourses).toHaveLength(3)

    // Rerender with different courses
    rerender({ courses: otherCourses })

    // Should reset to new courses
    expect(result.current.currentCourses).toHaveLength(1)
    expect(result.current.currentCourses[0].code).toBe('MO-BA101')

    // Structure should be updated
    expect(result.current.courses['1-1']).toHaveLength(1)
    expect(result.current.courses['1-1'][0].code).toBe('MO-BA101')
  })

  test('handles moving courses between containers', () => {
    const { result } = renderHook(() => useCurriculumBuilder(mockCourses))

    act(() => {
      // Move course from 1-1 to 2-1
      result.current.dispatch({
        type: 'ADD_COURSE_DRAG',
        payload: { key: '2-1', course: 'MO-IT0125' },
      })

      // Update course metadata
      result.current.setCurrentCourses((draft) => {
        const course = draft.find((c) => c.code === 'MO-IT0125')
        if (course) {
          course.year = 2
          course.semester = 1
        }
      })
    })

    // Course should be in new container
    expect(result.current.courses['2-1']).toHaveLength(1)
    expect(result.current.courses['2-1'][0].code).toBe('MO-IT0125')

    // Course should be removed from old container
    expect(result.current.courses['1-1']).toHaveLength(1)
    expect(result.current.courses['1-1'][0].code).toBe('MO-GE125')
  })

  test('handles deleting the last semester in a year', () => {
    // Setup with only one semester in year 2
    const singleSemesterCourse: CurriculumCourse[] = [
      {
        id: '1',
        code: 'MO-IT225',
        name: 'Data Structures',
        type: 'Major',
        department: 'IT',
        units: 3,
        year: 2,
        semester: 1,
      },
    ]

    const { result } = renderHook(() =>
      useCurriculumBuilder(singleSemesterCourse),
    )

    // Verify setup
    expect(
      result.current.structure.find((y) => y.year === 2)?.semesters,
    ).toEqual([1])

    act(() => {
      // Delete the only semester
      result.current.dispatch({
        type: 'DEL_SEM',
        payload: { year: 2, sem: 1 },
      })
    })

    // Year 2 should be completely removed
    expect(result.current.structure.find((y) => y.year === 2)).toBeUndefined()

    // Course should be removed
    expect(result.current.currentCourses).toHaveLength(0)
  })

  test('handles adding a course to a non-existent container', () => {
    const { result } = renderHook(() => useCurriculumBuilder())
    const newCourse = {
      id: '1',
      code: 'MO-IT501',
      name: 'Advanced AI',
      type: 'Elective',
      department: 'IT',
      units: 3,
      year: 5, // Beyond the default structure
      semester: 4, // Beyond the default structure
    }

    act(() => {
      // Add course to currentCourses
      result.current.setCurrentCourses((draft) => {
        draft.push(newCourse)
      })

      // Try to add to a non-existent container
      result.current.dispatch({
        type: 'ADD_COURSE_DRAG',
        payload: { key: '5-4', course: 'MO-IT501' },
      })
    })

    // Container should be created automatically
    expect(result.current.courses['5-4']).toBeDefined()
    expect(result.current.courses['5-4']).toHaveLength(1)
    expect(result.current.courses['5-4'][0].code).toBe('MO-IT501')
  })

  test('handles performance with a large number of courses', () => {
    // Generate 100 courses
    const manyCourses: CurriculumCourse[] = Array.from(
      { length: 100 },
      (_, i) => ({
        id: `id-${i}`,
        code: `MO-IT${i.toString().padStart(3, '0')}`,
        name: `Course ${i}`,
        type: 'Major',
        department: 'IT',
        units: 3,
        year: Math.ceil((i + 1) / 25), // 25 courses per year
        semester: (i % 3) + 1, // Distribute among 3 semesters
      }),
    )

    const { result } = renderHook(() => useCurriculumBuilder(manyCourses))

    // Should handle all courses without crashing
    expect(result.current.currentCourses).toHaveLength(100)
    expect(result.current.structure).toHaveLength(4) // 4 years

    // Test a drag operation with many courses
    act(() => {
      result.current.dispatch({
        type: 'ADD_COURSE_DRAG',
        payload: { key: '1-1', course: `MO-IT050` },
      })
    })

    // Operation should complete without error
    expect(result.current.courses['1-1']).toContainEqual(
      expect.objectContaining({ code: `MO-IT050` }),
    )
  })

  // Error Handling Tests

  test('handles invalid action gracefully', () => {
    const { result } = renderHook(() => useCurriculumBuilder())

    act(() => {
      // @ts-ignore - Testing invalid action
      result.current.dispatch({ type: 'INVALID_ACTION' })
    })

    // Should not crash and state should remain valid
    expect(result.current.structure).toBeDefined()
  })

  test('handles deleting non-existent course', () => {
    const { result } = renderHook(() => useCurriculumBuilder(mockCourses))

    act(() => {
      result.current.dispatch({
        type: 'DEL_COURSE',
        payload: { year: 1, sem: 1, course: 'NON-EXISTENT' },
      })
    })

    // Should not crash and valid courses should remain
    expect(result.current.courses['1-1']).toHaveLength(2)
  })

  test('handles malformed course data gracefully', () => {
    // @ts-ignore - Testing with invalid course data
    const invalidCourses = [{ id: '1', code: 'BAD-COURSE' }] as any

    const { result } = renderHook(() => useCurriculumBuilder(invalidCourses))

    // Should initialize without crashing
    expect(result.current.currentCourses).toHaveLength(1)
    expect(result.current.structure).toBeDefined()
  })

  test('maintains state consistency after multiple operations', () => {
    const { result } = renderHook(() => useCurriculumBuilder(mockCourses))

    act(() => {
      // Perform a series of operations
      result.current.dispatch({ type: 'ADD_YEAR' })
      result.current.dispatch({
        type: 'ADD_COURSE_DRAG',
        payload: { key: '2-1', course: 'MO-IT0125' },
      })
      result.current.dispatch({
        type: 'DEL_YEAR',
        payload: { year: 1 },
      })
      result.current.dispatch({
        type: 'ADD_SEM',
        payload: { year: 2 },
      })
    })

    // Structure should be consistent
    const years = result.current.structure.map((y) => y.year)
    expect(years).toEqual([1, 2, 3, 4]) // Years should be sequential

    // Each year should have its semesters in order
    result.current.structure.forEach((year) => {
      const semesters = [...year.semesters].sort((a, b) => a - b)
      expect(year.semesters).toEqual(semesters)
    })

    // All courses in currentCourses should be found in the containers
    result.current.currentCourses.forEach((course) => {
      const container =
        result.current.courses[`${course.year}-${course.semester}`]
      const found = container?.some((c) => c.code === course.code)
      expect(found).toBe(true)
    })
  })
})
