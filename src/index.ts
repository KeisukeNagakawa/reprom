import fs from "fs";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { spawnSync } from "child_process"; // ← 追加
import { loadConfig, ConfigSet } from "./config";
import { collectFiles } from "./fileCollector";
import { generateTree } from "./treeGenerator";
import { generateMarkdown } from "./markdownGenerator";

interface Arguments {
  config: string;
  name?: string;
}

/**
 * OSごとのクリップボードへコピーするための関数。
 * macOS: pbcopy
 * Windows: clip
 * Linux: xclip (要 xclip インストール)
 */
function copyToClipboard(text: string): void {
  const platform = process.platform;

  let command = "";
  let args: string[] = [];

  if (platform === "darwin") {
    // macOS
    command = "pbcopy";
  } else if (platform === "win32") {
    // Windows
    command = "clip";
  } else {
    // Linux (xclip が必要)
    command = "xclip";
    args = ["-selection", "clipboard"];
  }

  const proc = spawnSync(command, args, {
    input: text,
    stdio: ["pipe", "ignore", "ignore"], // 標準出力・エラーは表示しない
  });

  if (proc.error) {
    console.error(`Error copying to clipboard: ${proc.error.message}`);
  }
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
  const allConfigs = loadConfig(configFilePath);

  let targetConfig: ConfigSet;
  if (!argv.name) {
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
  console.log(`Total characters: ${totalChars}`);

  // 7. 出力先の判定
  const outputType = targetConfig.output ?? "file";
  const outFile = `asker-${targetConfig.name}.md`;

  if (outputType === "file") {
    fs.writeFileSync(outFile, mdOutput, "utf-8");
    console.log(`Exported to ${outFile}`);
  } else if (outputType === "clipboard") {
    copyToClipboard(mdOutput);
    console.log("Markdown has been copied to your clipboard.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
