import {
  DndProvider,
  type DropOptions,
  getBackendOptions,
  getDescendants,
  MultiBackend,
  Tree,
} from '@minoru/react-dnd-treeview'
import React, { useEffect, useState } from 'react'
import {
  ActionIcon,
  alpha,
  Group,
  Popover,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import {
  IconChevronRight,
  IconDotsVertical,
  IconFile,
  IconPlus,
} from '@tabler/icons-react'
import { useTreeConnectors } from '@/features/courses/useTreeConnectors.ts'
import { capitalizeFirstLetter } from '@/utils/formatters.ts'
import {
  convertContentNodesToTreeNodes,
  getChildTypeFromParentType,
} from '@/utils/helpers.ts'
import {
  type ContentNode,
  type ContentNodeType,
  type CourseNodeModel,
} from '@/features/courses/modules/types.ts'
import ContentDetailsEditor from '@/features/courses/course-editor/content-details-editor.tsx'

const reorderArray = (
  array: CourseNodeModel[],
  sourceIndex: number,
  targetIndex: number,
) => {
  const newArray = [...array]
  const element = newArray.splice(sourceIndex, 1)[0]
  newArray.splice(targetIndex, 0, element)
  return newArray
}

function injectData(nodes: CourseNodeModel[]): CourseNodeModel[] {
  const augmented: CourseNodeModel[] = [...nodes]

  // group nodes by parent
  const byParent: Record<string, CourseNodeModel[]> = {}
  for (const node of nodes) {
    if (!byParent[node.parent]) byParent[node.parent] = []
    byParent[node.parent].push(node)
  }

  // for each parent group, insert "+ Add" after the last child
  for (const parentId in byParent) {
    const siblings = byParent[parentId]
    if (siblings.length > 0) {
      augmented.push({
        id: `${parentId}-add`,
        parent: parentId,
        text: 'Add',
        droppable: false,
        data: { type: 'add-button' },
      })
    }
  }

  // assign parentType for all nodes
  for (const node of augmented) {
    if (node.parent === '0') continue

    const parent = augmented.find((n) => n.id === node.parent)
    if (parent) {
      const parentType =
        parent.data?.type === 'add-button' ? undefined : parent.data?.type

      node.data = {
        ...node.data,
        type: node.data?.type ?? 'add-button',
        parentType,
      }
    }
  }

  return augmented
}

interface CourseTreeProps {
  onAddButtonClick: (parentId: string, nodeType: ContentNodeType) => void
  onEditButtonClick: (
    nodeId: string,
    nodeType: ContentNodeType,
    nodeData: any,
  ) => void
  courseData: ContentNode[]
}

function CourseTree({
  onAddButtonClick,
  onEditButtonClick,
  courseData,
}: CourseTreeProps) {
  const theme = useMantineTheme()

  const [treeData, setTreeData] = useState<CourseNodeModel[]>(
    injectData(convertContentNodesToTreeNodes(courseData)),
  )
  const { isLastChild, getAncestors } = useTreeConnectors(treeData)

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<CourseNodeModel | null>(null)
  const [openedDetailsId, setOpenedDetailsId] = useState<string | null>(null)

  const handleDrop = (newTree: CourseNodeModel[], e: DropOptions) => {
    const { dragSourceId, dropTargetId, destinationIndex } = e
    if (!dragSourceId || !dropTargetId) return

    const start = treeData.find((v) => v.id === dragSourceId)
    const end = treeData.find((v) => v.id === dropTargetId)

    if (
      start?.parent === dropTargetId &&
      typeof destinationIndex === 'number'
    ) {
      setTreeData((treeData) =>
        reorderArray(treeData, treeData.indexOf(start), destinationIndex),
      )
      return
    }

    if (
      start?.parent !== dropTargetId &&
      typeof destinationIndex === 'number'
    ) {
      if (
        getDescendants(treeData, dragSourceId).find(
          (el) => el.id === dropTargetId,
        ) ||
        dropTargetId === dragSourceId ||
        (end && !end?.droppable)
      )
        return

      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start!),
          destinationIndex,
        )
        const movedElement = output.find((el) => el.id === dragSourceId)
        if (movedElement) movedElement.parent = dropTargetId

        return output
      })
    }
  }

  useEffect(() => {
    if (!selectedNode) return

    console.log('Edit button clicked for node:', selectedNode)
    if (
      selectedNode.data?.type !== 'add-button' &&
      selectedNode.data?.contentData
    ) {
      onEditButtonClick(
        selectedNode.id as string,
        selectedNode.data.type as ContentNodeType,
        selectedNode.data.contentData,
      )
    }
  }, [selectedNode])

  const handleDelete = (nodeId: string | number) => {
    setTreeData((prev) => prev.filter((node) => node.id !== nodeId))
  }

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Stack gap={0} h="100%">
        <Tree
          tree={treeData}
          sort={false}
          rootId={'0'}
          insertDroppableFirst={false}
          enableAnimateExpand
          onDrop={handleDrop}
          canDrop={() => true}
          canDrag={(node) => node?.data?.type !== 'add-button'}
          dropTargetOffset={5}
          initialOpen={true}
          render={(node, { depth, isOpen, isDropTarget, onToggle }) => {
            const ancestors = getAncestors(node)
            const indentModifier = 24
            const lineIndent = 20

            return (
              <div
                style={{
                  position: 'relative',
                  paddingLeft: depth * indentModifier,
                }}
              >
                {/* 1. Draw all vertical lines in a single loop */}
                {Array.from({ length: depth }).map((_, i) => {
                  const isLastVerticalSegment = i === depth - 1

                  // Skip drawing the vertical line if it's the last child
                  if (isLastChild(ancestors[i + 1])) return null

                  return (
                    <div
                      key={i}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom:
                          isLastVerticalSegment && isLastChild(node)
                            ? '50%'
                            : 0, // Draw the last vertical line to the middle if it's the last child
                        left: i * indentModifier + lineIndent,
                        width: 1.5,
                        backgroundColor: theme.colors.gray[4],
                      }}
                    />
                  )
                })}

                {/* 2. Draw the horizontal part of the elbow */}
                {depth > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: (depth - 1) * indentModifier + lineIndent,
                      width: 12,
                      height: 1.5,
                      backgroundColor: theme.colors.gray[4],
                    }}
                  />
                )}

                <NodeRow
                  node={node}
                  isOpen={isOpen}
                  isDropTarget={isDropTarget}
                  onToggle={onToggle}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                  onAddButtonClick={onAddButtonClick}
                  openedDetailsId={openedDetailsId}
                  setOpenedDetailsId={setOpenedDetailsId}
                  onSelectNode={(node) => setSelectedNode(node)}
                />
              </div>
            )
          }}
        />
      </Stack>
    </DndProvider>
  )
}

type NodeProps = {
  node: CourseNodeModel
  isOpen: boolean
  isDropTarget: boolean
  onToggle: () => void
  hoveredId: string | null
  setHoveredId: (id: string | null) => void
  onAddButtonClick: (parentId: string, nodeType: ContentNodeType) => void
  openedDetailsId: string | null
  setOpenedDetailsId: (id: string | null) => void
  onSelectNode: (node: CourseNodeModel) => void
}

const NodeRow = ({
  node,
  isOpen,
  isDropTarget,
  onToggle,
  hoveredId,
  setHoveredId,
  onAddButtonClick,
  openedDetailsId,
  setOpenedDetailsId,
  onSelectNode,
}: NodeProps) => {
  const theme = useMantineTheme()

  const handleSave = (data: any) => {
    console.log('Saving data:', data)
    // TODO: update state or make an API call
  }

  if (node.data?.type === 'add-button') {
    return (
      <Group
        px="sm"
        py="0.25rem"
        style={{
          cursor: 'pointer',
          borderRadius: 4,
          color: theme.colors.blue[6],
          fontStyle: 'italic',
        }}
        wrap={'nowrap'}
        onClick={() =>
          onAddButtonClick(
            node.parent as string,
            getChildTypeFromParentType(node.data?.parentType),
          )
        }
      >
        <IconPlus size={16} />
        <Text size="sm" fw={500} style={{ textWrap: 'nowrap' }}>
          Add{' '}
          {capitalizeFirstLetter(
            getChildTypeFromParentType(node.data?.parentType),
          )}
        </Text>
      </Group>
    )
  }

  return (
    <Popover
      position="right-start"
      withArrow
      shadow="md"
      offset={{ mainAxis: 12, crossAxis: 12 }}
      opened={openedDetailsId === node.id}
      zIndex={1000}
    >
      <Popover.Target>
        <Group
          justify="space-between"
          py="0.25rem"
          align={'center'}
          style={{
            backgroundColor: isDropTarget
              ? theme.colors.blue[0]
              : hoveredId === node.id
                ? `${alpha(theme.colors.gray[0], 0.8)}`
                : 'transparent',
            borderBottom: isDropTarget
              ? `3px solid ${theme.colors.blue[5]}`
              : '3px solid transparent',
            borderRadius: 4,
            transition: 'all 0.2s ease',
            cursor: node.droppable ? 'pointer' : 'default',
          }}
          wrap={'nowrap'}
          onMouseEnter={() => setHoveredId(node.id as string)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onSelectNode(node)}
        >
          <Group gap={'xs'} wrap={'nowrap'} miw={200} style={{ flex: 1 }}>
            {node.droppable ? (
              <ActionIcon onClick={onToggle} variant={'subtle'}>
                <IconChevronRight
                  size={20}
                  style={{
                    transition: 'transform 0.2s ease',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                />
              </ActionIcon>
            ) : (
              <IconFile size={20} />
            )}

            <Text
              fw={node.data?.type === 'module' ? 600 : 400}
              size={'sm'}
              lh={'xs'}
              style={{ textWrap: 'nowrap' }}
            >
              {node.text}
            </Text>
            <Text size="xs" c="dimmed">
              {node.data?.type}
            </Text>
          </Group>

          <ActionIcon
            variant="subtle"
            radius="xl"
            onClick={() => setOpenedDetailsId(node.id as string)}
          >
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Group>
      </Popover.Target>
      <Popover.Dropdown>
        <ContentDetailsEditor
          opened={true}
          type={node.data?.type as ContentNodeType}
          data={node.data?.contentData || null}
          mode={'edit'}
          onClose={() => {
            setOpenedDetailsId(null)
          }}
          onSave={handleSave}
        />
      </Popover.Dropdown>
    </Popover>
  )
}

export default CourseTree
