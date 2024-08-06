import { Exportable, Export } from "../model.js";
import matchAll from "@danielberndt/match-all";
import { loadFileToString, isMachedPath } from "../../util/index.js";
import { promisify } from "util";
import { readdir } from "fs";
import { BarrelerMode } from "../../model.js";

const reservedWordsRegex = /\b(export|class|abstract|var|let|const|interface|type|enum|function|default)\b/g;

export class File extends Exportable {
  private rootPath: string = "";
  private exportFromPath: string = "";
  private indexFilePath: string = "";

  private exports: Export[] = [];

  async init(): Promise<void> {
    if (isMachedPath(this.path, this.options.exclude)) return;
    if (!isMachedPath(this.path, this.options.include)) return;
    if (this.isIndex()) return;

    await this.preparePaths();
    await this.findExportsInFile();
    await this.exportExports();
  }

  private exportExports(): void {
    this.exporter.addExportsToIndex(
      {
        whatToExport: this.exports,
        fromFile: this.exportFromPath
      },
      this.indexFilePath
    );
  }

  private isIndex(): boolean {
    return this.path
      .substring(0, this.path.lastIndexOf("."))
      .endsWith("/index");
  }

  private async findExportsInFile(): Promise<void> {
    const fileContent: string = await loadFileToString(this.path);
    const exportLines = matchAll(fileContent, /(?:(?!\n)\s)*export .*/);

    this.exports = exportLines.reduce((exports: Export[], [line]) => {
      const exportFromLine = this.findExportableNameFromLine(line);

      if (exportFromLine && exportFromLine.name) {
        exports.push(exportFromLine);
      }

      return exports;
    }, []);
  }

  private findExportableNameFromLine(line: string): Export | null {
    const isDefault = !!line.match(/\bdefault\b/g);

    const withoutReservedWords = line.replace(reservedWordsRegex, "");
    const withoutBeginningSpaces = withoutReservedWords.replace(/^\s*/, "");

    // TODO: Check for possible multiple exports, multiline exports, etc.
    if (withoutBeginningSpaces.indexOf("{") === 0) return null;

    const exportName = withoutBeginningSpaces.match(/^\w*/);

    if (exportName) {
      return {
        name: exportName[0],
        isDefault
      };
    }

    return null;
  }

  private async preparePaths(): Promise<void> {
    this.rootPath = await this.getRootPath(this.path);

    this.exportFromPath = this.path.substring(
      this.rootPath.length,
      this.path.lastIndexOf(".")
    );

    const extension = this.path.indexOf(".js") === -1 ? "ts" : "js";
    this.indexFilePath = `${this.rootPath}/index.${extension}`;
  }

  private async getRootPath(file: string): Promise<string> {
    const rootPath = file.substring(0, file.lastIndexOf("/"));

    if (this.options.mode === BarrelerMode.AllLevelIndex) return rootPath;

    if (!(await this.hasSibilings(rootPath))) {
      return await this.getRootPath(rootPath);
    }

    return rootPath;
  }

  private async hasSibilings(dir: string): Promise<boolean> {
    const files = await promisify(readdir)(dir, null);

    const matchingFilesOrFolders = files.filter(file => {
      if (isMachedPath(file, this.options.exclude)) return false;
      if (isMachedPath(file, this.options.include)) return true;

      const isDirectory = file.search(/^[^\.][a-zA-Z0-9-_]*$/) !== -1;
      if (isDirectory) return true;

      return false;
    });

    return matchingFilesOrFolders.length > 1;
  }
}
