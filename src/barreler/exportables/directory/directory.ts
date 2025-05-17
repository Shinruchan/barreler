import { promisify } from "util";
import { readdir } from "fs";

import { parseFiles } from "../../parser/parser";
import { Exportable } from "../model";

export class Directory extends Exportable {
  private indexFilePath: string = "";
  private exportFromPath: string = "";

  async init(): Promise<void> {
    await this.findExportsInDir();

    if (!(await this.hasIndex())) return;

    await this.preparePaths();
    await this.exportToExporter();
  }

  private async exportToExporter(): Promise<void> {
    this.exporter.addExportsToIndex(
      {
        whatToExport: "*",
        fromFile: this.exportFromPath,
        fromFileExtension: "",
      },
      this.indexFilePath
    );
  }

  private async preparePaths(): Promise<void> {
    const rootPath: string = this.path.substring(0, this.path.lastIndexOf("/"));
    this.exportFromPath = this.path.substring(rootPath.length);

    const extension = await this.getExtension();
    this.indexFilePath = `${rootPath}/index.${extension}`;
  }

  private async findExportsInDir() {
    const files = await this.getFilesInDir();
    await parseFiles(files, this.exporter, this.options);
  }

  private async getFilesInDir(): Promise<string[]> {
    const files = await promisify(readdir)(this.path);

    const fullPathFiles = files.map((file) => `${this.path}/${file}`);

    return fullPathFiles;
  }

  private async getExtension(): Promise<string> {
    const files = await this.getFilesInDir();
    const file = files.find((file) =>
      ["ts", "js", "tsx", "jsx", "cjs", "mjs", "cts", "mts"].includes(
        file.substring(file.lastIndexOf(".") + 1)
      )
    );

    if (!file) {
      if (this.exporter.getIndexFiles().length === 0) return "js";

      const index = this.exporter.getIndexFiles()[0];
      return index.substring(index.lastIndexOf(".") + 1);
    }

    const ext = file.substring(file.lastIndexOf(".") + 1);

    if (ext === "tsx") return "ts";
    if (ext === "jsx") return "js";
    return ext;
  }

  private async hasIndex(): Promise<boolean> {
    const index = this.exporter
      .getIndexFiles()
      .find(
        (index) =>
          index.substring(0, index.lastIndexOf(".")) === `${this.path}/index`
      );

    return !!index;
  }
}
