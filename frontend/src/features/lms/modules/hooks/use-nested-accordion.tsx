import { useEffect, useState } from 'react'

interface NestedAccordionOptions {
  storageKey?: string
}

export function useNestedAccordion(options?: NestedAccordionOptions) {
  const storageKey = options?.storageKey
    ? `accordionState:${options.storageKey}`
    : null

  const [expanded, setExpanded] = useState<string[]>(() => {
    if (!storageKey) return []
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.every((v) => typeof v === 'string')) {
        return parsed
      }
      // invalid shape -> reset storage
      localStorage.setItem(storageKey, JSON.stringify([]))
      return []
    } catch {
      // parse error -> reset storage
      localStorage.setItem(storageKey, JSON.stringify([]))
      return []
    }
  })

  useEffect(() => {
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(expanded))
    } catch {
      // ignore write errors
    }
  }, [expanded, storageKey])

  const getSectionValues = () => expanded.filter((v) => !v.includes(':'))
  const getSubsectionValues = (sectionId: string) =>
    expanded
      .filter((v) => v.startsWith(`${sectionId}:`))
      .map((v) => v.split(':')[1])

  const setSectionValues = (values: string[]) => {
    const onlyChildren = expanded.filter((v) => v.includes(':'))
    setExpanded([...onlyChildren, ...values])
  }

  const setSubsectionValues = (sectionId: string, values: string[]) => {
    setExpanded((prev) => {
      const withoutChildren = prev.filter((v) => !v.startsWith(`${sectionId}:`))
      const newChildren = values.map((id) => `${sectionId}:${id}`)
      return [...withoutChildren, ...newChildren]
    })
  }

  const openAll = (
    sectionIds: string[],
    sectionToSubsectionIds: Record<string, string[]>,
  ) => {
    const all = [
      ...sectionIds,
      ...Object.entries(sectionToSubsectionIds).flatMap(([sid, subs]) =>
        subs.map((cid) => `${sid}:${cid}`),
      ),
    ]
    setExpanded(all)
  }

  const closeAll = () => setExpanded([])

  return {
    expanded,
    setExpanded,
    getSectionValues,
    getSubsectionValues,
    setSectionValues,
    setSubsectionValues,
    openAll,
    closeAll,
  }
}

export type UseNestedAccordionReturn = ReturnType<typeof useNestedAccordion>
