import {
  Tree,
  type NodeModel,
  DndProvider,
  type TreeMethods,
  getDescendants,
  type DropOptions,
  MultiBackend,
  getBackendOptions,
  useOpenIdsHelper
} from '@minoru/react-dnd-treeview';

interface NodeData {
  type: "module" | "subsection" | "item";
}

type CourseNodeModel = NodeModel<NodeData>;
import React, { useMemo, useState } from 'react'
import {
  ActionIcon,
  alpha,
  Group,
  Menu,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core'
import {
  IconArrowDown,
  IconDotsVertical,
  IconEdit,
  IconFile,
  IconFolder,
  IconFolderFilled,
  IconTrash,
} from '@tabler/icons-react'
import { useTreeConnectors } from '@/features/courses/course-editor/useTreeConnectors.ts'

const mockData: CourseNodeModel[] = [
  { 
    id: '1', 
    parent: '0', 
    text: "Module 1",
    droppable: true,
    data: { type: "module" } 
  },
  { 
    id: '2', 
    parent: '1', 
    text: "Subsection A",
    droppable: true,
    data: { type: "subsection" } 
  },
  { 
    id: '3', 
    parent: '2', 
    text: "Lesson 1", 
    data: { type: "item" } 
  },
  {
    id: '4',
    parent: '2',
    text: "Lesson 2",
    data: { type: "item" }
  },
  {
    id: '5',
    parent: '1',
    text: "Subsection B",
    droppable: true,
    data: { type: "subsection" }
  },
];

const reorderArray = (
    array: CourseNodeModel[],
    sourceIndex: number,
    targetIndex: number  // Add any other properties that your node data might have

) => {
    const newArray = [...array];
    const element = newArray.splice(sourceIndex, 1)[0];
    newArray.splice(targetIndex, 0, element);
    return newArray;
};

export default function CourseTree() {
  const theme = useMantineTheme();
  const [treeData, setTreeData] = useState<CourseNodeModel[]>(mockData);
  const { isLastChild, getAncestors } = useTreeConnectors(treeData);

  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const handleDrop = (newTree: CourseNodeModel[], e: DropOptions) => {
    const { dragSourceId, dropTargetId, destinationIndex } = e;
    if (!dragSourceId || !dropTargetId) return;

    const start = treeData.find((v) => v.id === dragSourceId);
    const end = treeData.find((v) => v.id === dropTargetId);

    if (start?.parent === dropTargetId && typeof destinationIndex === "number") {
      setTreeData((treeData) =>
        reorderArray(treeData, treeData.indexOf(start), destinationIndex)
      );
      return;
    }

    if (start?.parent !== dropTargetId && typeof destinationIndex === "number") {
      if (
        getDescendants(treeData, dragSourceId).find((el) => el.id === dropTargetId) ||
        dropTargetId === dragSourceId ||
        (end && !end?.droppable)
      )
        return;

      setTreeData((treeData) => {
        const output = reorderArray(
          treeData,
          treeData.indexOf(start!),
          destinationIndex
        );
        const movedElement = output.find((el) => el.id === dragSourceId);
        if (movedElement) movedElement.parent = dropTargetId;

        return output;
      });

    }
  };

    return (
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Stack gap={0} h="100%">
          <Tree
            tree={treeData}
            sort={false}
            rootId={"0"}
            insertDroppableFirst={false}
            enableAnimateExpand
            onDrop={handleDrop}
            canDrop={() => true}
            dropTargetOffset={5}
            initialOpen={true}
            render={(node, { depth, isOpen, isDropTarget, onToggle }) => {
              const ancestors = getAncestors(node);
              const indentModifier = 24;
              const lineIndent = 20;

              return(
              <div
                style={{
                  position: "relative",
                  paddingLeft: depth * indentModifier,
                }}
              >

                {/* 1. Draw all vertical lines in a single loop */}
                {Array.from({ length: depth }).map((_, i) => {
                  const isLastVerticalSegment = i === depth - 1;

                  // Skip drawing the vertical line if it's the last child
                  if (isLastChild(ancestors[i + 1])) {
                    return null;
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: isLastVerticalSegment && isLastChild(node) ? "50%" : 0, // Draw the last vertical line to the middle if it's the last child
                        left: i * indentModifier + lineIndent,
                        width: 1.5,
                        backgroundColor: theme.colors.gray[4],
                      }}
                    />
                  );
                })}

                {/* 2. Draw the horizontal part of the elbow */}
                {depth > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: (depth - 1) * indentModifier + lineIndent,
                      width: 12,
                      height: 1.5,
                      backgroundColor: theme.colors.gray[4],
                    }}
                  />
                )}

                <Group
                  justify="space-between"
                  px={'sm'}
                  py="0.25rem"
                  onClick={onToggle}
                  style={{
                    backgroundColor: isDropTarget
                      ? theme.colors.blue[0]
                      : hoveredId === node.id
                        ? `${alpha(theme.colors.gray[0], 0.8)}`
                        : "transparent",
                    borderBottom:
                      isDropTarget
                        ? `3px solid ${theme.colors.blue[5]}`
                        : "3px solid transparent",
                    borderRadius: 4,
                    transition: "all 0.2s ease",
                    cursor: node.droppable ? "pointer" : "default",
                  }}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Group gap={'xs'}>
                    {
                      node.droppable ? (isOpen ? <IconFolder size={20}/> : <IconFolderFilled size={20}/>) : <IconFile size={20}/>
                    }

                    <Text fw={node.data?.type === "module" ? 600 : 400} size={'md'} lh={'xs'}>
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
                      <Menu.Item leftSection={<IconEdit size={14} />}>Edit</Menu.Item>
                      <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                        Delete
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </div>
            )}}
          />
        </Stack>
      </DndProvider>
    );
}
