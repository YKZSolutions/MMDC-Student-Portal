import { useMemo } from "react";
import type { NodeModel } from "@minoru/react-dnd-treeview";

export function useTreeConnectors<T>(tree: NodeModel<T>[]) {
  const nodeMap = useMemo(() => {
    const map = new Map<string | number, NodeModel<T>>();
    tree.forEach((node) => map.set(node.id, node));
    return map;
  }, [tree]);

  const lastChildMap = useMemo(() => {
    const map = new Map<string | number, true>();
    const childrenByParent = new Map<string | number, NodeModel<T>[]>();

    tree.forEach((node) => {
      if (!childrenByParent.has(node.parent)) {
        childrenByParent.set(node.parent, []);
      }
      childrenByParent.get(node.parent)!.push(node);
    });

    childrenByParent.forEach((children) => {
      if (children.length > 0) {
        map.set(children[children.length - 1].id, true);
      }
    });

    return map;
  }, [tree]);

  function isLastChild(node: NodeModel<T> | undefined): boolean {
    return !!node && lastChildMap.has(node.id);
  }

  /**
   * Gets the ancestor chain for a given node.
   * @param node The node to get ancestors for.
   * @returns An array of ancestors, from the root down to the immediate parent.
   */
  function getAncestors(node: NodeModel<T>): NodeModel<T>[] {
    const ancestors: NodeModel<T>[] = [];
    let current = nodeMap.get(node.parent); // Start from the parent
    while (current) {
      ancestors.unshift(current); // Add to front to keep order: [root, grandparent, parent]
      current = nodeMap.get(current.parent);
    }
    return ancestors;
  }

  return { isLastChild, getAncestors };
}