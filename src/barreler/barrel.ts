import { parseFiles } from "./parser/parser";
import { exportExportables } from "./exporter/exporter";

export const barrel = async (files: string[]): Promise<void> => {
  const exportables = await parseFiles(files);
  await exportExportables(exportables);
};
