import fg from "fast-glob";
import path from "path";
import { TargetsConfig } from "./config";

export function collectFiles(targets: TargetsConfig): string[] {
  const { include, exclude = [], filePatterns = [] } = targets;

  // include + filePatterns から最終的に検索パターンを組み立てる
  const patterns: string[] = [];
  for (const inc of include) {
    // Remove any leading/trailing slashes to prevent path duplication
    const normalizedInc = inc.replace(/^\/+|\/+$/g, "");
    for (const pattern of filePatterns) {
      // Remove any leading **/ from the pattern to prevent it from searching from root
      const cleanPattern = pattern.replace(/^\*\*\//, "");
      // Don't include the directory in the pattern if it's already in the include path
      const patternWithoutDir = cleanPattern.replace(
        new RegExp(`^${normalizedInc}/`),
        ""
      );
      patterns.push(patternWithoutDir);
    }
  }

  // fast-glob で探索
  const result = fg.sync(patterns, {
    ignore: exclude,
    dot: true, // .gitignore に載るようなファイルやフォルダも対象に含める場合はtrue
    onlyFiles: false, // ディレクトリも結果に含めておき、後で tree 生成に使う
    cwd: path.join(process.cwd(), include[0]), // Use the include directory as the base
  });

  // 重複排除と正規化
  const normalizedResults = result.map((p) => {
    // Prepend the include directory and normalize path
    return path.join(include[0], p).replace(/\\/g, "/");
  });
  return Array.from(new Set(normalizedResults));
}
