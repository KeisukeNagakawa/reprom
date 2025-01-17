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
