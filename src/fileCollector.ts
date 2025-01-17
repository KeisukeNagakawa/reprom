import fg from "fast-glob";
import path from "path";
import { TargetsConfig } from "./config";

export function collectFiles(targets: TargetsConfig): string[] {
  const { include, exclude = [], filePatterns = [] } = targets;

  // include + filePatterns から最終的に検索パターンを組み立てる
  const patterns: string[] = [];
  for (const inc of include) {
    for (const pattern of filePatterns) {
      const joined = path.posix.join(inc.replace(/\\/g, "/"), pattern);
      patterns.push(joined);
    }
  }

  // fast-glob で探索
  const result = fg.sync(patterns, {
    ignore: exclude,
    dot: true, // .gitignore に載るようなファイルやフォルダも対象に含める場合はtrue
    onlyFiles: false, // ディレクトリも結果に含めておき、後で tree 生成に使う
  });

  // 重複排除
  return Array.from(new Set(result));
}
