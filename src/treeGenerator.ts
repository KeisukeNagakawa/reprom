import { TreeConfig } from "./config";

interface TreeNode {
  name: string;
  children: TreeNode[];
  isDirectory: boolean;
}

function buildTree(paths: string[], maxDepth: number = Infinity): TreeNode {
  const root: TreeNode = { name: ".", children: [], isDirectory: true };

  for (const filePath of paths) {
    const parts = filePath.split("/");
    let currentNode = root;
    let currentDepth = 0;

    for (const part of parts) {
      if (currentDepth >= maxDepth) break;

      let child = currentNode.children.find((node) => node.name === part);
      if (!child) {
        child = {
          name: part,
          children: [],
          isDirectory: currentDepth < parts.length - 1,
        };
        currentNode.children.push(child);
      }
      currentNode = child;
      currentDepth++;
    }
  }

  return root;
}

function renderTree(node: TreeNode, prefix: string = ""): string {
  let result = "";
  const isLast = true;

  if (node.name !== ".") {
    result += `${prefix}${isLast ? "└── " : "├── "}${node.name}\n`;
    prefix += isLast ? "    " : "│   ";
  }

  const sortedChildren = node.children.sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });

  for (let i = 0; i < sortedChildren.length; i++) {
    const child = sortedChildren[i];
    const isLastChild = i === sortedChildren.length - 1;
    const childPrefix = prefix + (isLastChild ? "└── " : "├── ");
    const nextPrefix = prefix + (isLastChild ? "    " : "│   ");

    result += `${childPrefix}${child.name}\n`;
    if (child.children.length > 0) {
      result += renderTree(child, nextPrefix);
    }
  }

  return result;
}

export function generateTree(paths: string[], config: TreeConfig = {}): string {
  const { maxDepth = Infinity, directoriesOnly = false } = config;

  // If directoriesOnly is true, filter out non-directory paths
  const filteredPaths = directoriesOnly
    ? paths.filter((p) => !p.includes("."))
    : paths;

  const tree = buildTree(filteredPaths, maxDepth);
  return renderTree(tree);
}
