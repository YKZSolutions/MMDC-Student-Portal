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
  Box,
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
  IconList,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { capitalizeFirstLetter } from '@/utils/formatters.ts'
import {
  type ContentNode,
  type ContentNodeType,
  type CourseNodeModel,
  type Module,
} from '@/features/courses/modules/types.ts'
import { convertModuleToTreeData, getTypeFromLevel } from '@/utils/helpers.ts'

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

function injectAddButtons(nodes: CourseNodeModel[]): CourseNodeModel[] {
  const augmented: CourseNodeModel[] = [...nodes]

  function inject(nodeParent: string, level: number) {
    augmented.push({
      id: `${nodeParent}-add`,
      parent: nodeParent,
      text: 'Add',
      droppable: false,
      data: {
        level: level,
        type: 'add-button',
      },
    })
  }

  // Add "Add" buttons after the last child of each section
  for (const node of nodes) {
    if (node.data && node.data.level !== 3) {
      const level = node.data.level + 1
      inject(node.id as string, level)
    }
  }

  inject('root', 1)

  return augmented
}

// Get appropriate icon for node type
const getNodeIcon = (type: ContentNodeType | 'add-button', size = 16) => {
  switch (type) {
    case 'section':
      return <IconList size={size} />
    case 'item':
      return <IconFile size={size} />
    default:
      return <IconFile size={size} />
  }
}

interface ContentTreeProps {
  module: Module
  onAddButtonClick: (parentId: string, nodeType: ContentNodeType) => void
  onNodeChange: (nodeData: ContentNode) => void
}

const ContentTree = ({
  module,
  onAddButtonClick,
  onNodeChange,
}: ContentTreeProps) => {
  const [treeData, setTreeData] = useState<CourseNodeModel[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | number | null>(
    null,
  )

  console.log('Module:', module)

  // Sync treeData when courseData changes
  useEffect(() => {
    const nodes = convertModuleToTreeData(module)
    setTreeData(injectAddButtons(nodes))
    console.log('Tree Data:', treeData)
  }, [module])

  const handleDrop = (newTree: CourseNodeModel[], e: DropOptions) => {
    const { dragSourceId, dropTargetId, destinationIndex } = e
    if (!dragSourceId || !dropTargetId) return

    const dragNode = treeData.find((v) => v.id === dragSourceId)
    const dropNode = treeData.find((v) => v.id === dropTargetId)

    if (!dragNode || typeof destinationIndex !== 'number') return

    // Prevent invalid drops
    if (
      getDescendants(treeData, dragSourceId).find(
        (el) => el.id === dropTargetId,
      ) ||
      dropTargetId === dragSourceId ||
      (dropNode && !dropNode.droppable)
    )
      return

    // Update tree data
    setTreeData((prevTree) => {
      const newTree = reorderArray(
        prevTree,
        prevTree.indexOf(dragNode),
        destinationIndex,
      )
      const movedElement = newTree.find((el) => el.id === dragSourceId)
      if (movedElement) {
        movedElement.parent = dropTargetId
      }
      return newTree
    })
  }

  // Handle node selection and trigger onChange
  const handleNodeSelect = (node: CourseNodeModel) => {
    if (node.data?.type === 'add-button') return

    setSelectedNodeId(node.id)

    if (node.data?.contentData) {
      onNodeChange(node.data.contentData)
    }
  }

  const handleDelete = (nodeId: string | number) => {
    setTreeData((prev) => prev.filter((node) => node.id !== nodeId))
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
    }
  }

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Stack gap={0} h="100%">
        <Tree
          tree={treeData}
          sort={false}
          rootId={'root'}
          insertDroppableFirst={false}
          enableAnimateExpand
          onDrop={handleDrop}
          canDrop={() => true}
          canDrag={(node) => node?.data?.type !== 'add-button'}
          dropTargetOffset={5}
          initialOpen={true}
          render={(node, { depth, isOpen, isDropTarget, onToggle }) => {
            console.log('Rendering node:', node)
            return (
              <NodeRow
                node={node}
                depth={depth}
                isOpen={isOpen}
                isDropTarget={isDropTarget}
                isSelected={selectedNodeId === node.id}
                onToggle={onToggle}
                onAddButtonClick={onAddButtonClick}
                onSelectNode={handleNodeSelect}
                onDelete={handleDelete}
              />
            )
          }}
        />
      </Stack>
    </DndProvider>
  )
}

interface NodeRowProps {
  node: CourseNodeModel
  depth: number
  isOpen: boolean
  isDropTarget: boolean
  isSelected: boolean
  onToggle: () => void
  onAddButtonClick: (parentId: string, nodeType: ContentNodeType) => void
  onSelectNode: (node: CourseNodeModel) => void
  onDelete: (nodeId: string | number) => void
}

const NodeRow = ({
  node,
  depth,
  isOpen,
  isDropTarget,
  isSelected,
  onToggle,
  onAddButtonClick,
  onSelectNode,
  onDelete,
}: NodeRowProps) => {
  const theme = useMantineTheme()

  // Calculate proper indentation (20px per level)
  const indentSize = depth * 20

  const handleDelete = (nodeId: string | number) => {}

  if (node.data?.type === 'add-button') {
    return (
      <Box pl={indentSize + 24} py={2}>
        <Button
          variant="transparent"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() =>
            onAddButtonClick(
              node.parent as string,
              getTypeFromLevel(node.data?.level),
            )
          }
          style={{
            color: theme.colors.blue[6],
            fontStyle: 'italic',
            height: 'auto',
            padding: '4px 8px',
          }}
        >
          <Text size="sm" fw={500}>
            Add {capitalizeFirstLetter(getTypeFromLevel(node.data?.level))}
          </Text>
        </Button>
      </Box>
    )
  }

  return (
    <Group
      gap={0}
      wrap="nowrap"
      style={{
        paddingLeft: indentSize,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: isSelected
          ? theme.colors.blue[0]
          : isDropTarget
            ? theme.colors.gray[1]
            : 'transparent',
        borderRadius: 4,
        border: isDropTarget
          ? `2px solid ${theme.colors.blue[4]}`
          : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        margin: '1px 0',
      }}
      onClick={() => onSelectNode(node)}
    >
      {/* Toggle button or spacer */}
      <Box
        w={24}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {node.droppable ? (
          <ActionIcon
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            variant="subtle"
            size="sm"
            style={{ minWidth: 20, minHeight: 20 }}
          >
            <IconChevronRight
              size={14}
              style={{
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              }}
            />
          </ActionIcon>
        ) : null}
      </Box>

      {/* Node icon */}
      <Box mr="xs" style={{ display: 'flex', alignItems: 'center' }}>
        {getNodeIcon(node.data?.type || 'item', 16)}
      </Box>

      {/* Node text */}
      <Text
        fw={400}
        size="sm"
        lh="sm"
        truncate
        style={{
          flex: 1,
          color: isSelected ? theme.colors.blue[7] : 'inherit',
        }}
      >
        {node.text}
      </Text>

      {/* Node type badge */}
      <Text
        size="xs"
        c="dimmed"
        mr="xs"
        style={{ textTransform: 'capitalize' }}
      >
        {node.data?.type}
      </Text>

      {/* Actions menu */}
      <Menu withinPortal shadow="md" width={150}>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={(e) => e.stopPropagation()}
            style={{
              opacity: isSelected ? 1 : 0.7,
              transition: 'opacity 0.15s ease',
            }}
          >
            <IconDotsVertical size={14} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => onDelete(node.id)}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  )
}

export default ContentTree
