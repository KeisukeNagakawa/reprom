以下はaskerのファイルとディレクトリ構造の一覧です。


# Directory Structure

```
src
├── config.ts
├── fileCollector.ts
├── index.ts
├── markdownGenerator.ts
└── treeGenerator.ts
```

# File Contents

## src/config.ts

```
import fs from "fs";
import yaml from "js-yaml";

export interface TargetsConfig {
  include: string[];
  exclude?: string[];
  filePatterns?: string[];
}

export interface TreeConfig {
  maxDepth?: number;
  directoriesOnly?: boolean;
}

export interface ConfigSet {
  name: string;
  preText?: string;
  postText?: string;
  targets: TargetsConfig;
  tree?: TreeConfig;
}

interface RootConfig {
  configs: ConfigSet[];
}

export function loadConfig(filePath: string): ConfigSet[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = yaml.load(raw) as RootConfig;
  return data.configs || [];
}

```

## src/fileCollector.ts

```
import fg from "fast-glob";
import path from "path";
import { TargetsConfig } from "./config";
export function collectFiles(targets: TargetsConfig): string[] {
  const { include, exclude = [], filePatterns = [] } = targets;
  // パターンの組み立ては「そのまま」あるいは "**/*" デフォルトにする程度にしておく
  const patterns = filePatterns.length ? filePatterns : ["**/*"];

  const result = fg.sync(patterns, {
    ignore: exclude,
    dot: true,
    onlyFiles: false,
    cwd: path.join(process.cwd(), include[0]),
  });

  // fast-glob は `cwd` を基準とした相対パスで返す
  // 例: "config.ts", "index.ts", "subdir/file.ts" など
  // それに `include[0]` を結合すれば最終的に "src/config.ts" などが得られる
  const normalizedResults = result.map((p) =>
    path.join(include[0], p).replace(/\\/g, "/")
  );
  return Array.from(new Set(normalizedResults));
}

```

## src/index.ts

```
import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { loadConfig, ConfigSet } from "./config";
import { collectFiles } from "./fileCollector";
import { generateTree } from "./treeGenerator";
import { generateMarkdown } from "./markdownGenerator";

interface Arguments {
  config: string;
  name?: string;
}

async function main() {
  // 1. CLI 引数のパース
  const argv = (await yargs(hideBin(process.argv))
    .option("config", {
      type: "string",
      default: "asker.config.yaml",
      description: "設定ファイル(YAML)のパス",
    })
    .option("name", {
      type: "string",
      description: "使用する設定セット (config[].name) を指定",
    })
    .help()
    .parseAsync()) as Arguments;

  // 2. 設定ファイルの読み込み
  const configFilePath = path.resolve(process.cwd(), argv.config);
  const allConfigs = loadConfig(configFilePath); // asker.config.yaml から読み込み

  let targetConfig: ConfigSet;
  if (!argv.name) {
    // --name オプションが指定されなかった場合、最初の設定を使用
    targetConfig = allConfigs[0];
  } else {
    const found = allConfigs.find((c) => c.name === argv.name);
    if (!found) {
      throw new Error(`Config "${argv.name}" not found in ${configFilePath}`);
    }
    targetConfig = found;
  }

  // 3. ファイル探索
  const matchedFiles = collectFiles(targetConfig.targets);

  // 4. ツリー構造生成
  const normalizedPaths = matchedFiles.map((filePath) =>
    filePath.replace(/^\.\//, "").replace(/^\/+/, "")
  );
  const treeText = generateTree(normalizedPaths, targetConfig.tree);

  // 5. Markdown 本文生成
  const mdOutput = generateMarkdown({
    config: targetConfig,
    matchedFiles,
    treeText,
  });

  // 6. 文字数カウント
  const totalChars = mdOutput.length;
  const mdFinal =
    mdOutput + `\n\n## 統計情報\n- **合計文字数**: ${totalChars}\n`;

  // 7. ファイル出力
  const outFile = `asker-${targetConfig.name}.md`;
  fs.writeFileSync(outFile, mdFinal, "utf-8");

  console.log(`Exported to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

```

## src/markdownGenerator.ts

```
import fs from "fs";
import { ConfigSet } from "./config";

interface MarkdownGeneratorOptions {
  config: ConfigSet;
  matchedFiles: string[];
  treeText: string;
}

export function generateMarkdown(options: MarkdownGeneratorOptions): string {
  const { config, matchedFiles, treeText } = options;
  let markdown = "";

  // Add pre-text if configured
  if (config.preText) {
    markdown += `${config.preText}\n\n`;
  }

  // Add directory structure
  markdown += "# Directory Structure\n\n";
  markdown += "```\n";
  markdown += treeText;
  markdown += "```\n\n";

  // Add file contents
  markdown += "# File Contents\n\n";
  for (const file of matchedFiles) {
    if (fs.statSync(file).isDirectory()) continue;

    markdown += `## ${file}\n\n`;
    markdown += "```\n";
    markdown += fs.readFileSync(file, "utf-8");
    markdown += "\n```\n\n";
  }

  // Add post-text if configured
  if (config.postText) {
    markdown += `${config.postText}\n\n`;
  }

  return markdown;
}

```

## src/treeGenerator.ts

```
import { TreeConfig } from "./config";

interface TreeNode {
  name: string;
  children: TreeNode[];
  isDirectory: boolean;
}

function buildTree(paths: string[], maxDepth: number = Infinity): TreeNode {
  const root: TreeNode = { name: ".", children: [], isDirectory: true };

  // Group files by their root directory
  const rootDirs = new Set<string>();
  paths.forEach((path) => {
    const firstDir = path.split("/")[0];
    rootDirs.add(firstDir);
  });

  // If there's only one root directory, make it the root node
  if (rootDirs.size === 1) {
    const rootDir = Array.from(rootDirs)[0];
    root.name = rootDir;

    // Process paths relative to the root directory
    for (const filePath of paths) {
      const parts = filePath.split("/").slice(1); // Skip the root directory
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
  } else {
    // If there are multiple root directories, keep the "." root
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
  }

  return root;
}
function renderTree(node: TreeNode, prefix = "", isRoot = true): string {
  let result = "";

  // ルートノードが "." でなければ、ノード自身を表示する
  if (isRoot && node.name !== ".") {
    result += `${node.name}\n`;
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
      result += renderTree(child, nextPrefix, false);
    }
  }

  return result;
}

export function generateTree(paths: string[], config: TreeConfig = {}): string {
  const { maxDepth = Infinity, directoriesOnly = false } = config;

  const filteredPaths = directoriesOnly
    ? paths.filter((p) => !p.includes("."))
    : paths;

  const tree = buildTree(filteredPaths, maxDepth);
  return renderTree(tree, "", true);
}

```



## 統計情報
- **合計文字数**: 7873
