以下はaskerのファイルとディレクトリ構造の一覧です。


# Directory Structure

```
├── .vscode
│   └── settings.json
├── bin
│   └── asker.js
├── src
│   ├── config.ts
│   ├── fileCollector.ts
│   ├── index.ts
│   ├── markdownGenerator.ts
│   └── treeGenerator.ts
├── asker.config.yaml
├── package.json
├── readme.md
└── tsconfig.json
```

# File Contents

## readme.md

```
# asker

**asker** は、指定したディレクトリ構成とファイル内容をひとつの Markdown ファイルにまとめる CLI ツールです。  
ChatGPT などの AI にコードを渡す際、大量のファイルを個別にコピー＆ペーストする手間を省きます。

- ディレクトリ構成を `tree` コマンドのような形式で出力
- 対象のファイル内容をすべて Markdown にまとめて出力
- ファイルの先頭・末尾に挿入する文言（説明や質問など）を柔軟に設定可能
- 最終的に生成される Markdown の合計文字数を出力
- 1 つの設定ファイル (YAML) 内で複数の設定セットを管理し、用途に応じて使い分け

## 特徴

- **複数の設定**: `configs` 配列で複数の設定を定義可能
- **ターゲット指定**: `include` と `exclude`、さらに `filePatterns` を組み合わせて対象ファイルを柔軟に指定
- **tree 表示**: ディレクトリのみ表示・最大深度などオプションを通じて制御
- **Markdown 出力**: 1 つの `.md` ファイルにまとめられるため、ChatGPT への貼り付けが容易
- **統計情報**: 生成した Markdown の**合計文字数**を最後に表示

## インストール

プロジェクト内で devDependencies として使う場合:

```bash
npm install --save-dev asker
```

または、

```bash
yarn add --dev asker
```

## 使い方

1. **設定ファイルの作成**  
   プロジェクトルート等に `asker.config.yaml` といった名前で YAML ファイルを作成し、以下のように設定します。

   ```yaml
   configs:
     - name: "eric-evans"
       preText: |
         これは "eric-evans" 設定で出力されるファイルです。
         相談したい内容としては…
       postText: |
         以上が "eric-evans" 設定の出力です。
         何かアドバイスあればお願いします。
       targets:
         include:
           - "packages/core"
           - "packages/utils"
         exclude:
           - "packages/core/dist"
           - "**/node_modules"
         filePatterns:
           - "**/*.ts"
           - "**/*.js"
       tree:
         maxDepth: 5
         directoriesOnly: false

     - name: "review"
       preText: |
         こちらは "review" 設定用です。
         Web アプリをレビューしていただきたく…
       postText: |
         以上が "review" 設定の出力です。
         問題点や修正点のご指摘をお待ちしています。
       targets:
         include:
           - "apps/www"
         exclude:
           - "apps/www/node_modules"
         filePatterns:
           - "**/*.vue"
           - "**/*.js"
           - "**/*.ts"
       tree:
         maxDepth: 10
         directoriesOnly: false
   ```

   - `name` は CLI 実行時に使用する設定セットの識別子
   - `preText` / `postText` は生成される Markdown の先頭・末尾に挿入
   - `include` / `exclude` / `filePatterns` を組み合わせて対象ファイルを決定
   - `tree` の設定でディレクトリ構成の表示を調整

2. **CLI の実行**  
   ターミナルで以下のコマンドを実行します。

   ```bash
   npx asker --config=asker.config.yaml --name=eric-evans
   ```

   - `--config`: YAML 設定ファイルのパスを指定 (デフォルトは `asker.config.yaml`)
   - `--name`: 実行したい設定セットを指定 (設定ファイル内の `configs[].name`)

   実行すると、`asker-export-<設定名>.md` (例: `asker-export-eric-evans.md`) が生成され、
   以下のような情報が 1 つの Markdown にまとめられます。

   1. `preText` に記載した文言
   2. ディレクトリ構成 (`tree` コマンド風)
   3. 対象ファイルの全内容 (拡張子に応じてコードブロックを自動判定)
   4. `postText` に記載した文言
   5. **合計文字数** の統計情報

3. **package.json の scripts に登録する例**  
   毎回同じオプションを打つのが面倒な場合、`package.json` にスクリプトを追加しておくと便利です。

   ```jsonc
   {
     "scripts": {
       "export:eric-evans": "asker --config=asker.config.yaml --name=eric-evans",
       "export:review": "asker --config=asker.config.yaml --name=review"
     }
   }
   ```

   以後は `npm run export:eric-evans` などでサクッと実行できます。

## 出力されるファイルのイメージ

生成される Markdown (`asker-export-eric-evans.md`) は、ざっくり以下のような構造です:

```markdown
(ここに preText が挿入される)

## ディレクトリ構成
```

```
packages
├── core
│   ├── index.ts
│   └── ...
├── utils
│   └── ...
└── ...
```

````
## ファイル一覧と内容

### packages/core/index.ts
```ts
// index.ts の中身
````

(他のファイルも同様に続く)

(ここに postText が挿入される)

## 統計情報

- **合計文字数**: 123456

```

## オプション・機能

- **複数設定セット**:
  - `asker.config.yaml` の `configs[]` にいくつでも設定セットを追加可能
  - `--name` オプションで実行時に使う設定を選択
- **ターゲット指定**:
  - `include`: 対象に含めたいディレクトリ・パス
  - `exclude`: 除外したいディレクトリ・パス
  - `filePatterns`: ファイル拡張子や glob パターン (例: `**/*.ts`, `**/*.js`)
- **tree 表示**:
  - `maxDepth`: ツリーを再帰的にどの階層まで表示するか
  - `directoriesOnly`: ディレクトリのみを表示するかどうか
- **先頭・末尾メッセージ**:
  - `preText`: Markdown の最初に挿入
  - `postText`: Markdown の最後に挿入
- **統計情報**:
  - 出力した Markdown 全体の文字数を最後に追記

## ライセンス

[MIT License](./LICENSE)

ご自由にご利用ください。

## コントリビュート

- バグ報告や機能要望は Issue へ
- プルリクエスト歓迎します

気軽にご利用いただき、ChatGPT とのやりとりが快適になることを願っています。
```

```

## asker.config.yaml

```
configs:
  - name: "asker"
    preText: |
      以下はaskerのファイルとディレクトリ構造の一覧です。
    targets:
      include:
        - "src"
        - "bin"
        - "./"
      exclude:
        - "**/node_modules"
        - "dist"
      filePatterns:
        - "**/*.ts"
        - "**/*.js"
        - "**/*.yaml"
        - "**/*.json"
        - "readme.md"
    tree:
      maxDepth: 5
      directoriesOnly: false

  - name: "review"
    preText: |
      こちらは "review" 設定用です。
    postText: |
      以上が "review" 設定の出力です。
    targets:
      include:
        - "apps/www"
      exclude:
        - "apps/www/node_modules"
      filePatterns:
        - "**/*.vue"
        - "**/*.js"
        - "**/*.ts"
    tree:
      maxDepth: 10
      directoriesOnly: false

```

## package.json

```
{
  "name": "asker",
  "version": "1.0.0",
  "description": "A CLI tool to export directory structure and file contents into a single Markdown for AI.",
  "main": "dist/index.js",
  "bin": {
    "asker": "bin/asker.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node dist/src/index.js",
    "dev": "tsc -w"
  },
  "keywords": [],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/fs-extra": "^11.0.2",
    "@types/node": "^18.15.3",
    "@types/yargs": "^17.0.24",
    "fast-glob": "^3.2.12",
    "fs-extra": "^11.1.1",
    "js-yaml": "^4.1.0",
    "typescript": "^4.9.5",
    "yargs": "^17.7.2"
  },
  "dependencies": {
    "@types/js-yaml": "^4.0.9"
  }
}
```

## tsconfig.json

```
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": [
    "src"
  ]
}
```

## .vscode/settings.json

```
{
  "editor.tabSize": 2,
  "editor.detectIndentation": false,
  "files.exclude": {
    "**/*.log": true,
    "**/node_modules": true,
  }
}
```

## bin/asker.js

```
#!/usr/bin/env node

require("../dist/index.js");

```

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
// fileCollector.ts
import fg from "fast-glob";
import path from "path";
import { TargetsConfig } from "./config";

export function collectFiles(targets: TargetsConfig): string[] {
  const { include, exclude = [], filePatterns = [] } = targets;
  // パターンが指定されていない場合はデフォルトで " **/* " とする
  const patterns = filePatterns.length ? filePatterns : ["**/*"];

  // 複数の include に対してパターンをフラット化する
  // 例: include = ["src","bin"], patterns = ["**/*.ts"] -> ["src/**/*.ts", "bin/**/*.ts"]
  const mergedPatterns = include.flatMap((inc) =>
    patterns.map((pat) => path.join(inc, pat).replace(/\\/g, "/"))
  );

  // fast-glob を実行。ルートは process.cwd() にする
  const result = fg.sync(mergedPatterns, {
    ignore: exclude,
    dot: true,
    onlyFiles: false,
    cwd: process.cwd(),
  });

  // 今度はパスを二重に連結しないようにする
  // fast-glob は既に "src/config.ts", "bin/xxx.ts" のような相対パスを返すはず
  const normalizedResults = result.map((p) => p.replace(/\\/g, "/"));

  // 重複除去
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
- **合計文字数**: 14076
