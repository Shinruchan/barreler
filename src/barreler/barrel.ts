import { parseFiles } from "./parser/parser";
import { Exporter } from "./exporter/exporter";

export const barrel = async (files: string[]): Promise<void> => {
  const exporter = new Exporter();
  await parseFiles(files, exporter);
  await exporter.exportToFiles();
};
