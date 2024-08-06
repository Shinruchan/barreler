import { ExportLine, Export } from "../exportables/model.js";
import {
  removeExportLinesBeforeUpdating,
  appendFile,
  compareFileExportsFirst,
  compareAlphabetically,
  compareDefaultFirst,
} from "../util/index.js";

export class Exporter {
  private indexFiles: Map<string, ExportLine[]> = new Map();

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

  private async exportStringLineToFile(line: ExportLine, file: string) {
    const toBeWritten = `export ${line.whatToExport} from '.${line.fromFile}';\n`;

    await removeExportLinesBeforeUpdating(file, line.fromFile);
    await appendFile(file, toBeWritten);
  }

  private async exportExportsLineToFile(line: ExportLine, file: string) {
    let listOfExports = line.whatToExport as Export[];

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

    const toBeWritten = `export { ${listOfExportables} } from '.${line.fromFile}';\n`;

    await removeExportLinesBeforeUpdating(file, line.fromFile);
    await appendFile(file, toBeWritten);
  }
}
