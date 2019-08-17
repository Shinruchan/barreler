import { promisify } from "util";
import { readdir } from "fs";

import { appendFile, removeExportLinesBeforeUpdating } from "../utils";
import { FileType } from "../model";
import { exportExportables } from "../exporter";
import { parseFiles } from "../parser";

import { Exportable } from "./model";

export class Directory implements Exportable {
  private directory: string = "";
  private indexFilePath: string = "";
  private exportFromPath: string = "";

  private exportables: Exportable[] = [];

  async init(directory: string): Promise<boolean> {
    this.directory = directory;

    await this.preparePaths();

    await this.findExportsInDir();

    return true;
  }

  async writeToFile(): Promise<void> {
    await exportExportables(this.exportables);

    // TODO check if has index file...

    const exportedData = `export * from '.${this.exportFromPath}';\n`;

    console.log(exportedData);

    await removeExportLinesBeforeUpdating(
      this.indexFilePath,
      this.exportFromPath
    );
    await appendFile(this.indexFilePath, exportedData);
  }

  getType(): FileType {
    return FileType.Directory;
  }

  getFile(): string {
    return this.directory;
  }

  private async preparePaths(): Promise<void> {
    const rootPath: string = this.directory.substring(
      0,
      this.directory.lastIndexOf("/")
    );
    this.exportFromPath = this.directory.substring(rootPath.length);

    const extension = await this.getExtension();
    this.indexFilePath = `${rootPath}/index.${extension}`;
  }

  private async findExportsInDir() {
    const files = await this.getFilesInDir();
    this.exportables = await parseFiles(files);
  }

  private async getFilesInDir(): Promise<string[]> {
    const files = await promisify(readdir)(this.directory);

    const fullPathFiles = files.map(file => `${this.directory}/${file}`);

    return fullPathFiles;
  }

  private async getExtension(): Promise<string> {
    const files = await this.getFilesInDir();
    const file = files.find(file =>
      ["ts", "js", "tsx", "jsx"].includes(
        file.substring(file.lastIndexOf(".") + 1)
      )
    );

    if (!file) return "js";

    return file.substring(file.lastIndexOf(".") + 1);
  }
}
