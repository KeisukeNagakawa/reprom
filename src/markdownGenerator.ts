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
