import * as fs from "fs";
import { promisify } from "util";
import { filePathToRegex } from "./to-regex.js";

export const appendFile = promisify(fs.appendFile);
export const writeFile = promisify(fs.writeFile);

export const isDirectory = async (filePath: string): Promise<boolean> => {
  const stats: fs.Stats = await promisify(fs.stat)(filePath);

  return stats.isDirectory();
};

export const loadFileToString = async (filePath: string): Promise<string> => {
  const data = await promisify(fs.readFile)(filePath);

  return data.toString();
};

export const removeExportLinesBeforeUpdating = async (
  indexFilePath: string,
  searchPattern: string
) => {
  try {
    const fileData = await loadFileToString(indexFilePath);
    const fileDataUnformatted = fileData
      .replace(/\n/g, "")
      .replace(/;/g, ";\n");

    const lines = fileDataUnformatted.split("\n");

    const modifiedLines = lines.filter(
      (line) => line.indexOf(searchPattern) === -1
    );

    await writeFile(indexFilePath, modifiedLines.join("\n"));
  } catch {}
};

export const isMachedPath = (path: string, patterns: string[]): boolean => {
  if (!patterns) return false;

  for (const pattern of patterns) {
    let patternRegex = filePathToRegex(pattern);

    if (path.search(patternRegex) !== -1) return true;
  }

  return false;
};
