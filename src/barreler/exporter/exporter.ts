import { ExportLine, Export } from "../exportables/model";
import { BarrelerExtension, BarrelerOptions } from "../model";
import {
  removeExportLinesBeforeUpdating,
  appendFile,
  compareFileExportsFirst,
  compareAlphabetically,
  compareDefaultFirst,
} from "../util/index";

export class Exporter {
  private indexFiles: Map<string, ExportLine[]> = new Map();

  constructor(private options: BarrelerOptions) {}

  addExportsToIndex(exportLine: ExportLine, indexFile: string) {
    const existingExportLines = this.indexFiles.get(indexFile);

    if (existingExportLines) {
      this.indexFiles.set(indexFile, [...existingExportLines, exportLine]);
    } else {
      this.indexFiles.set(indexFile, [exportLine]);
    }
  }

  getIndexFiles(): string[] {
    return Array.from(this.indexFiles.keys());
  }

  async exportToFiles() {
    for (let index of this.getIndexFiles()) {
      let exportLines = this.indexFiles.get(index);
      if (!exportLines) return false;

      exportLines = exportLines.sort(compareFileExportsFirst);

      for (const line of exportLines) {
        if (typeof line.whatToExport === "string") {
          await this.exportStringLineToFile(line, index);
        } else {
          await this.exportExportsLineToFile(line, index);
        }
      }
    }
  }

  /**
   * Exports "export * from 'some/index';"
   * - Cannot be type export
   */
  private async exportStringLineToFile(line: ExportLine, file: string) {
    const toBeWritten = `export ${line.whatToExport} from '.${
      line.fromFile
    }${this.getExtension(line)}';\n`;

    await removeExportLinesBeforeUpdating(file, line.fromFile, false);
    await appendFile(file, toBeWritten);
  }

  private async exportExportsLineToFile(line: ExportLine, file: string) {
    let listOfExports = line.whatToExport as Export[];
    const isTypeExport = Boolean(listOfExports[0].isType);

    listOfExports = listOfExports.sort((a, b) =>
      compareAlphabetically(a.name, b.name)
    );
    listOfExports = listOfExports.sort(compareDefaultFirst);

    const listOfExportables = listOfExports
      .map((exp) => {
        if (!exp.isDefault) return exp.name;

        return `default as ${exp.name}`;
      })
      .join(", ");

    const typePart = isTypeExport ? "type " : "";
    const toBeWritten = `export ${typePart}{ ${listOfExportables} } from '.${
      line.fromFile
    }${this.getExtension(line)}';\n`;

    await removeExportLinesBeforeUpdating(file, line.fromFile, isTypeExport);
    await appendFile(file, toBeWritten);
  }

  private getExtension(line: ExportLine): string {
    switch (this.options.extensions) {
      case BarrelerExtension.SameAsFile:
        return line.fromFileExtension;

      case BarrelerExtension.Custom:
        return this.options.customExtension
          ? `.${this.options.customExtension}`
          : "";

      case BarrelerExtension.None:
      default:
        return "";
    }
  }
}
