import { Exportable, Export } from "./model";
import matchAll from "@danielberndt/match-all";
import {
  loadFileToString,
  appendFile,
  removeExportLinesBeforeUpdating
} from "../utils";
import { FileType, fileExtensions } from "../model";

const reservedWordsRegex = /export|class|abstract|var|let|const|interface|type|enum|function|default/g;

export class File implements Exportable {
  private file: string = "";
  private rootPath: string = "";
  private exportFromPath: string = "";
  private indexFilePath: string = "";

  private exports: Export[] = [];

  async init(file: string): Promise<boolean> {
    this.file = file;

    if (!this.hasValidExtension()) return false;

    this.preparePaths();

    await this.findExportsInFile();

    return true;
  }

  async writeToFile(): Promise<void> {
    const listOfExportables = this.exports
      .map(exp => {
        if (!exp.isDefault) return exp.name;

        return `default as ${exp.name}`;
      })
      .join(", ");

    const exportedData = `export { ${listOfExportables} } from '.${
      this.exportFromPath
    }';\n`;

    await removeExportLinesBeforeUpdating(
      this.indexFilePath,
      this.exportFromPath
    );
    await appendFile(this.indexFilePath, exportedData);
  }

  getType(): FileType {
    return FileType.File;
  }

  getFile(): string {
    return this.file;
  }

  private hasValidExtension(): boolean {
    const match = this.file.match(/.*\.(.+)$/);

    if (match && match.length > 1) {
      const ext = match[1];
      return fileExtensions.includes(ext);
    }

    return false;
  }

  private async findExportsInFile(): Promise<void> {
    const fileContent: string = await loadFileToString(this.file);
    const exportLines = matchAll(fileContent, /.*export .*/);

    this.exports = exportLines.reduce((exports: Export[], [line]) => {
      const isDefault = !!line.match(/\bdefault/g);

      const withoutReservedWords = line.replace(reservedWordsRegex, "");
      const withoutBeginningSpaces = withoutReservedWords.replace(/^\s*/, "");

      // TODO: Check for possible multiple exports, multiline exports, etc.
      if (withoutBeginningSpaces.indexOf("{") === 0) return exports;

      const exportName = withoutBeginningSpaces.match(/^\w*/);

      if (exportName) {
        exports.push({
          name: exportName[0],
          isDefault
        });
      }

      return exports;
    }, []);
  }

  private preparePaths(): void {
    this.rootPath = this.file.substring(0, this.file.lastIndexOf("/"));
    this.exportFromPath = this.file.substring(
      this.rootPath.length,
      this.file.lastIndexOf(".")
    );

    const extension = this.file.indexOf(".js") === -1 ? "ts" : "js";
    this.indexFilePath = `${this.rootPath}/index.${extension}`;
  }
}
