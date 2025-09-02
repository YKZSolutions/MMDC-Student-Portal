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
  Button,
  Group,
  Menu,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import {
  IconChevronRight,
  IconDotsVertical,
  IconFile,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useTreeConnectors } from '@/features/courses/hooks/useTreeConnectors.ts'
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
import { modals } from '@mantine/modals'

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
  courseData: ContentNode[]
  onAddButtonClick: (parentId: string, nodeType: ContentNodeType) => void
  onNodeChange: (nodeData: ContentNode) => void
}

function CourseTree({
  courseData,
  onAddButtonClick,
  onNodeChange,
}: CourseTreeProps) {
  const theme = useMantineTheme()

  const [treeData, setTreeData] = useState<CourseNodeModel[]>(
    injectData(convertContentNodesToTreeNodes(courseData)),
  )
  const { isLastChild, getAncestors } = useTreeConnectors(treeData)

  const [selectedNode, setSelectedNode] = useState<CourseNodeModel | null>(null)
  const [openedDetailsId, setOpenedDetailsId] = useState<string | null>(null)

  // Sync treeData when courseData changes
  useEffect(() => {
    setTreeData(injectData(convertContentNodesToTreeNodes(courseData)))
  }, [courseData])

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

    if (
      selectedNode.data?.type !== 'add-button' &&
      selectedNode.data?.contentData
    ) {
      onNodeChange(selectedNode.data.contentData)
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
            return (
              <NodeRow
                node={node}
                isOpen={isOpen}
                isDropTarget={isDropTarget}
                onToggle={onToggle}
                onAddButtonClick={onAddButtonClick}
                onSelectNode={(node) => setSelectedNode(node)}
              />
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
  onAddButtonClick: (parentId: string, nodeType: ContentNodeType) => void
  onSelectNode: (node: CourseNodeModel) => void
}

const NodeRow = ({
  node,
  isOpen,
  isDropTarget,
  onToggle,
  onAddButtonClick,
  onSelectNode,
}: NodeProps) => {
  const theme = useMantineTheme()

  const handleDelete = (nodeId: string | number) => {}

  if (node.data?.type === 'add-button') {
    return (
      <Button
        variant={'transparent'}
        px="sm"
        py="0.25rem"
        style={{
          cursor: 'pointer',
          borderRadius: 4,
          color: theme.colors.blue[6],
          fontStyle: 'italic',
        }}
        onClick={() =>
          onAddButtonClick(
            node.parent as string,
            getChildTypeFromParentType(node.data?.parentType),
          )
        }
        leftSection={<IconPlus size={16} />}
      >
        <Text size="sm" fw={500} style={{ textWrap: 'nowrap' }}>
          Add{' '}
          {capitalizeFirstLetter(
            getChildTypeFromParentType(node.data?.parentType),
          )}
        </Text>
      </Button>
    )
  }

  return (
    <Group
      justify="space-between"
      py="0.25rem"
      align={'center'}
      style={{
        backgroundColor: isDropTarget ? theme.colors.blue[0] : 'transparent',
        borderBottom: isDropTarget
          ? `3px solid ${theme.colors.blue[5]}`
          : '3px solid transparent',
        borderRadius: 4,
        transition: 'all 0.2s ease',
        cursor: node.droppable ? 'pointer' : 'default',
      }}
      wrap={'nowrap'}
      onClick={() => onSelectNode(node)}
    >
      <Group gap={'xs'} wrap={'nowrap'} style={{ flex: 1 }}>
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
          truncate
        >
          {node.text}
        </Text>
        <Text size="xs" c="dimmed">
          {node.data?.type}
        </Text>
      </Group>

      <Menu withinPortal shadow="md" width={150}>
        <Menu.Target>
          <ActionIcon variant="subtle" radius="xl">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => handleDelete(node.id)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

export default CourseTree
