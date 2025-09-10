import { createContext, useRef, type ReactNode } from 'react'
import { create, createStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'

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

interface CurriculumCourse {
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

interface CurriculumBuilderState {
  sortables: Record<string, string[]>
  currentCourses: CurriculumCourse[]

  setSortables: (
    newState: (items: Record<string, string[]>) => Record<string, string[]>,
  ) => void
  addYear: () => void
  deleteYear: (year: number) => void
  addSem: (year: number) => void
  deleteSem: (year: number, sem: number) => void
  addCourse: (key: string, course: CurriculumCourse) => void
  deleteCourse: (year: number, sem: number, courseCode: string) => void
}

export const CurriculumBuilderStoreContext = createContext<ReturnType<
  typeof initCurriculumBuilderStore
> | null>(null)

export function initCurriculumBuilderStore() {
  return createStore<CurriculumBuilderState>()(
    immer((set) => ({
      sortables: initialSortable,
      currentCourses: [],

      setSortables: (items) =>
        set((state) => {
          state.sortables = items(state.sortables)
        }),
      addYear: () =>
        set((state) => {
          const nextYear =
            Math.max(
              ...Object.keys(state.sortables).map((key) =>
                Number(key.split('-')[0]),
              ),
            ) + 1

          state.sortables[`${nextYear}-1`] = []
          state.sortables[`${nextYear}-2`] = []
          state.sortables[`${nextYear}-3`] = []
        }),
      deleteYear: (year) =>
        set((state) => {
          for (const key in state.sortables) {
            if (key.startsWith(`${year}-`)) {
              delete state.sortables[key]
            }
          }
          const entries = Object.entries(state.sortables)
          for (const [key, value] of entries) {
            const [y, sem] = key.split('-').map(Number)
            if (y > year) {
              const newKey = `${y - 1}-${sem}`
              delete state.sortables[key]
              state.sortables[newKey] = value
            }
          }
        }),
      addSem: (year) =>
        set((state) => {
          const semesters = Object.keys(state.sortables)
            .map((key) => key.split('-').map(Number))
            .filter(([y]) => y === year)
            .map(([_, sem]) => sem)

          const highestSem = semesters.length > 0 ? Math.max(...semesters) : 0
          const newSem = highestSem + 1

          state.sortables[`${year}-${newSem}`] = []
        }),
      deleteSem: (year, sem) =>
        set((state) => {
          delete state.sortables[`${year}-${sem}`]

          const remainingInYear = Object.keys(state.sortables).some((k) => {
            const [y] = k.split('-').map(Number)
            return y === year
          })

          if (!remainingInYear) {
            const toShiftYears = Object.entries(state.sortables)
              .map(([k, v]) => {
                const [y, s] = k.split('-').map(Number)
                return { y, s, v }
              })
              .filter(({ y }) => y > year)
              .sort((a, b) => a.y - b.y || a.s - b.s)

            for (const { y, s, v } of toShiftYears) {
              state.sortables[`${y - 1}-${s}`] = v
              delete state.sortables[`${y}-${s}`]
            }
          } else {
            const toShift = Object.entries(state.sortables)
              .map(([k, v]) => {
                const [y, s] = k.split('-').map(Number)
                return { y, s, v }
              })
              .filter(({ y, s }) => y === year && s > sem)
              .sort((a, b) => a.s - b.s)

            for (const { s, v } of toShift) {
              state.sortables[`${year}-${s - 1}`] = v
              delete state.sortables[`${year}-${s}`]
            }
          }
        }),
      addCourse: (key, course) =>
        set((state) => {
          state.sortables[key].push(course.code)
          state.currentCourses.push(course)
        }),
      deleteCourse: (year, sem, courseCode) =>
        set((state) => {
          const index = state.sortables[`${year}-${sem}`].indexOf(courseCode)
          if (index !== -1) {
            state.sortables[`${year}-${sem}`].splice(index, 1)
          }
          state.currentCourses = state.currentCourses.filter(
            (course) => course.code !== courseCode,
          )
        }),
    })),
  )
}

export function CurriculumBuilderStoreProvider({
  children,
}: {
  children: ReactNode
}) {
  const store = useRef(initCurriculumBuilderStore()).current

  return (
    <CurriculumBuilderStoreContext.Provider value={store}>
      {children}
    </CurriculumBuilderStoreContext.Provider>
  )
}
