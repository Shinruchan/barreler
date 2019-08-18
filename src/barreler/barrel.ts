import { parseFiles } from "./parser";
import { exportExportables } from "./exporter";

export const barrel = async (files: string[]): Promise<void> => {
  const exportables = await parseFiles(files);
  await exportExportables(exportables);
};
