import { produce } from 'immer'
import { useImmer, useImmerReducer } from 'use-immer'
import { useMemo } from 'react'

export interface CurriculumCourse {
  id: string
  code: string
  name: string
  prereq?: {
    name: string
    code: string
  }
  coreq?: {
    name: string
    code: string
  }
  type: 'Core' | 'Elective' | 'General' | 'Major' | 'Specialization' | string
  department: 'GE' | 'IT' | 'BA' | string
  units: number
  year: number
  semester: number
}

export interface YearStructure {
  year: number
  semesters: number[]
}

const initialSortable: Record<string, string[]> = {
  '1-1': [],
  '1-2': [],
  '1-3': [],
  '2-1': [],
  '2-2': [],
  '2-3': [],
  '3-1': [],
  '3-2': [],
  '3-3': [],
  '4-1': [],
  '4-2': [],
  '4-3': [],
}

export type StructureAction =
  | {
      type: 'SET'
      payload: (items: Record<string, string[]>) => Record<string, string[]>
    }
  | { type: 'ADD_YEAR' }
  | { type: 'DEL_YEAR'; payload: { year: number } }
  | { type: 'ADD_SEM'; payload: { year: number } }
  | { type: 'DEL_SEM'; payload: { year: number; sem: number } }
  | {
      type: 'ADD_COURSE'
      payload: { year: number; sem: number; course: string }
    }
  | {
      type: 'ADD_COURSE_DRAG'
      payload: { key: string; course: string }
    }
  | {
      type: 'DEL_COURSE'
      payload: { year: number; sem: number; course: string }
    }

const reducer = (draft: Record<string, string[]>, action: StructureAction) => {
  switch (action.type) {
    case 'SET': {
      return action.payload(draft)
    }
    case 'ADD_YEAR': {
      const years = Object.keys(draft)
        .map((key) => Number(key.split('-')[0]))
        .filter((year) => !isNaN(year))

      const nextYear = years.length > 0 ? Math.max(...years) + 1 : 1

      draft[`${nextYear}-1`] = []
      draft[`${nextYear}-2`] = []
      draft[`${nextYear}-3`] = []
      break
    }
    case 'DEL_YEAR': {
      const { year } = action.payload

      const keysToDelete = Object.keys(draft).filter((key) =>
        key.startsWith(`${year}-`),
      )
      keysToDelete.forEach((key) => {
        delete draft[key]
      })

      const entries = [...Object.entries(draft)]
      for (const [key, value] of entries) {
        const [y, sem] = key.split('-').map(Number)
        if (y > year) {
          const newKey = `${y - 1}-${sem}`
          draft[newKey] = [...value]
          delete draft[key]
        }
      }
      break
    }
    case 'ADD_SEM': {
      const { year } = action.payload

      const semesters = Object.keys(draft)
        .map((key) => key.split('-').map(Number))
        .filter(([y]) => y === year)
        .map(([_, sem]) => sem)

      const highestSem = semesters.length > 0 ? Math.max(...semesters) : 0
      const newSem = highestSem + 1

      draft[`${year}-${newSem}`] = []
      break
    }
    case 'DEL_SEM': {
      const { year, sem } = action.payload
      const yearSemKey = `${year}-${sem}`

      if (yearSemKey in draft) {
        delete draft[yearSemKey]
      }

      const remainingInYear = Object.keys(draft).some((k) => {
        const [y] = k.split('-').map(Number)
        return y === year
      })

      if (!remainingInYear) {
        const toShiftYears = Object.entries(draft)
          .map(([k, v]) => {
            const [y, s] = k.split('-').map(Number)
            return { y, s, v }
          })
          .filter(({ y }) => y > year)
          .sort((a, b) => a.y - b.y || a.s - b.s)

        for (const { y, s, v } of toShiftYears) {
          draft[`${y - 1}-${s}`] = [...v]
          delete draft[`${y}-${s}`]
        }
      } else {
        const toShift = Object.entries(draft)
          .map(([k, v]) => {
            const [y, s] = k.split('-').map(Number)
            return { y, s, v }
          })
          .filter(({ y, s }) => y === year && s > sem)
          .sort((a, b) => a.s - b.s)

        for (const { s, v } of toShift) {
          draft[`${year}-${s - 1}`] = [...v]
          delete draft[`${year}-${s}`]
        }
      }
      break
    }
    case 'ADD_COURSE_DRAG': {
      const { key, course } = action.payload

      if (!(key in draft)) {
        draft[key] = []
      }

      if (!draft[key].includes(course)) {
        draft[key].push(course)
      }

      Object.keys(draft).forEach((otherKey) => {
        if (otherKey !== key) {
          const index = draft[otherKey].indexOf(course)
          if (index !== -1) {
            draft[otherKey].splice(index, 1)
          }
        }
      })

      break
    }
    case 'DEL_COURSE': {
      const { year, sem, course } = action.payload
      const key = `${year}-${sem}`

      if (key in draft) {
        const index = draft[key].indexOf(course)
        if (index !== -1) {
          draft[key].splice(index, 1)
        }
      }
      break
    }
    default: {
      break
    }
  }
}

export const useCurriculumBuilder = (initialCourses?: CurriculumCourse[]) => {
  const [currentCourses, setCurrentCourses] = useImmer<CurriculumCourse[]>(
    initialCourses || [],
  )

  const initialStructure = useMemo(() => {
    if (!initialCourses || initialCourses.length === 0) {
      return initialSortable
    }

    const structure = { ...initialSortable }

    initialCourses.forEach((course) => {
      const key = `${course.year}-${course.semester}`

      if (!structure[key]) {
        structure[key] = []
      }

      if (!structure[key].includes(course.code)) {
        structure[key].push(course.code)
      }
    })

    return structure
  }, [])

  const [sortables, dispatch] = useImmerReducer(reducer, initialStructure)

  const courses: Record<string, CurriculumCourse[]> = Object.fromEntries(
    Object.entries(sortables).map(([key, codes]) => [
      key,
      codes
        .map((code) => currentCourses.find((course) => course.code === code))
        .filter((course): course is CurriculumCourse => Boolean(course)),
    ]),
  )

  const transformed: YearStructure[] = Object.keys(sortables).reduce<
    YearStructure[]
  >((acc, key) => {
    const [yearStr, semStr] = key.split('-')
    const year = Number(yearStr)
    const sem = Number(semStr)

    const existing = acc.find((y) => y.year === year)
    if (existing) {
      if (!existing.semesters.includes(sem)) {
        existing.semesters.push(sem)
      }
    } else {
      acc.push({ year, semesters: [sem] })
    }

    return acc
  }, [])

  const structure = produce(transformed, (draft) => {
    draft.sort((a, b) => a.year - b.year)
    draft.forEach((year) => {
      year.semesters.sort((a, b) => a - b)
    })
  })

  return {
    structure,
    courses,
    currentCourses,
    setCurrentCourses,
    dispatch,
  }
}
