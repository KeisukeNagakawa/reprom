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
  // Normalize paths and remove duplicate src directory
  const normalizedPaths = matchedFiles.map((filePath) => {
    // Remove leading ./ and /
    let normalized = filePath.replace(/^\.\//, "").replace(/^\/+/, "");
    // Remove duplicate src directory
    normalized = normalized.replace(/^src\/src\//, "src/");
    return normalized;
  });
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
