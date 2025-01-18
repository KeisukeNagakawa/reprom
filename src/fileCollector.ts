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
