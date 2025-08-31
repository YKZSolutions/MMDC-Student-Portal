import { produce } from 'immer'
import { useImmer, useImmerReducer } from 'use-immer'

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
  type: 'Core' | 'Elective' | 'General' | 'Major' | 'Specialization'
  department: 'GE' | 'IT' | 'BA'
  units: number
  year: number
  semester: number
}

export const mockCourses: CurriculumCourse[] = [
  {
    id: 'c2',
    code: 'MO-GE102',
    name: 'Philippine Popular Culture',
    type: 'General',
    department: 'GE',
    units: 3,
    year: 1,
    semester: 1,
  },
  {
    id: 'c3',
    code: 'MO-IT200D2',
    name: 'Capstone 2',
    type: 'Core',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 2,
  },
  {
    id: 'c4',
    code: 'MO-IT151',
    name: 'Platform Technologies',
    type: 'Major',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 2,
  },
  {
    id: 'c5',
    code: 'MO-IT121',
    name: 'Mobile Develpment',
    type: 'Major',
    department: 'IT',
    units: 3,
    year: 1,
    semester: 3,
  },
  {
    id: 'c6',
    code: 'GE-MATH2',
    name: 'Discrete Mathematics',
    type: 'General',
    department: 'GE',
    units: 3,
    year: 2,
    semester: 1,
  },
]

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
      const nextYear =
        Math.max(
          ...Object.keys(draft).map((key) => Number(key.split('-')[0])),
        ) + 1

      draft[`${nextYear}-1`] = []
      draft[`${nextYear}-2`] = []
      draft[`${nextYear}-3`] = []
      break
    }
    case 'DEL_YEAR': {
      const { year } = action.payload
      for (const key in draft) {
        if (key.startsWith(`${year}-`)) {
          delete draft[key]
        }
      }
      const entries = Object.entries(draft)
      for (const [key, value] of entries) {
        const [y, sem] = key.split('-').map(Number)
        if (y > year) {
          const newKey = `${y - 1}-${sem}`
          delete draft[key]
          draft[newKey] = value
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

      delete draft[`${year}-${sem}`]

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
          draft[`${y - 1}-${s}`] = v
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
          draft[`${year}-${s - 1}`] = v
          delete draft[`${year}-${s}`]
        }
      }
      break
    }
    case 'ADD_COURSE_DRAG': {
      const { key, course } = action.payload
      draft[key].push(course)
      break
    }
    case 'DEL_COURSE': {
      const { year, sem, course } = action.payload
      const index = draft[`${year}-${sem}`].indexOf(course)
      if (index !== -1) {
        draft[`${year}-${sem}`].splice(index, 1)
      }
      break
    }
    default: {
      break
    }
  }
}

export const useCurriculumBuilder = () => {
  const [currentCourses, setCurrentCourses] = useImmer<CurriculumCourse[]>([])
  const [sortables, dispatch] = useImmerReducer(reducer, initialSortable)

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
  })

  return {
    structure,
    courses,
    currentCourses,
    setCurrentCourses,
    dispatch,
  }
}
