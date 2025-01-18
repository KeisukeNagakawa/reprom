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
