import { useEffect, useState } from 'react'
import type { CourseBasicDetails } from '@/features/courses/types.ts'
import {
  type ContentNode,
  type Module,
} from '@/features/courses/modules/types.ts'
import { mockCourseBasicDetails, mockModule } from '@/features/courses/mocks.ts'

// Helper function to find a node in the module structure
const findNodeInModule = (
  module: Module,
  nodeId: string,
): ContentNode | null => {
  // Search in top-level sections
  for (const section of module.sections) {
    if (section.id === nodeId) return section

    // Search in section items
    for (const item of section.items) {
      if (item.id === nodeId) return item
    }

    // Search in subsections
    if (section.subsections) {
      for (const subsection of section.subsections) {
        if (subsection.id === nodeId) return subsection

        // Search in subsection items
        for (const item of subsection.items) {
          if (item.id === nodeId) return item
        }
      }
    }
  }

  return null
}

// Helper function to update a node in the module structure
const updateNodeInModule = (
  module: Module,
  nodeId: string,
  updates: Partial<ContentNode>,
): Module => {
  const updatedModule = { ...module }

  // Recursive function to update sections and their items
  const updateSection = (section: any): any => {
    if (section.id === nodeId) {
      return { ...section, ...updates }
    }

    // Update items in this section
    const updatedItems = section.items.map((item: any) =>
      item.id === nodeId ? { ...item, ...updates } : item,
    )

    // Update subsections recursively
    const updatedSubsections =
      section.subsections?.map(updateSection) || section.subsections

    return {
      ...section,
      items: updatedItems,
      subsections: updatedSubsections,
    }
  }

  // Update all sections
  updatedModule.sections = updatedModule.sections.map(updateSection)

  return updatedModule
}

export const useCourseData = (courseCode?: string) => {
  const [courseDetails, setCourseDetails] = useState<CourseBasicDetails>()
  const [module, setModule] = useState<Module>(mockModule)

  useEffect(() => {
    if (courseCode) {
      setCourseDetails(
        mockCourseBasicDetails.find(
          (course) => course.courseCode === courseCode,
        ),
      )
    }
  }, [courseCode])

  const updateCourseData = (data: ContentNode) => {
    setModule((prev) => updateNodeInModule(prev, data.id, data))
  }

  const updateCourseContent = (data: string, itemId?: string) => {
    if (itemId) {
      setModule((prev) => updateNodeInModule(prev, itemId, { content: data }))
    }
  }

  // Helper to get a specific node from the module
  const getNode = (nodeId: string): ContentNode | null => {
    return findNodeInModule(module, nodeId)
  }

  return {
    courseDetails,
    setCourseDetails,
    module,
    updateCourseData,
    updateCourseContent,
    getNode,
  }
}
