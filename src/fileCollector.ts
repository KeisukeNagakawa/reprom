import fg from "fast-glob";
import path from "path";
import { TargetsConfig } from "./config";
import fs from "fs";

export function collectFiles(targets: TargetsConfig): string[] {
  const { include, exclude = [], filePatterns = [] } = targets;
  // パターンが指定されていない場合はデフォルトで " **/* " とする
  const patterns = filePatterns.length ? filePatterns : ["**/*"];

  // 新：ディレクトリ・ファイルを判別して fast-glob 用パターンを作る
  const mergedPatterns: string[] = [];
  for (const inc of include) {
    const fullPath = path.resolve(process.cwd(), inc);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // ディレクトリの場合は patterns を結合
        for (const pat of patterns) {
          // inc と pat を結合
          mergedPatterns.push(path.join(inc, pat).replace(/\\/g, "/"));
        }
      } else if (stat.isFile()) {
        // ファイルが直接指定されていた場合は、そのファイルをそのまま追加
        mergedPatterns.push(inc.replace(/\\/g, "/"));
      }
    } else {
      // 存在しないパス等は無視するか、エラーにするかはお好みで
    }
  }

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
