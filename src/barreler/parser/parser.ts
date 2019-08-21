import { Exportable, File, Directory } from "../exportables";
import { isDirectory } from "../util";
import { Exporter } from "../exporter/exporter";

export const parseFiles = async (
  paths: string[],
  exporter: Exporter
): Promise<void> => {
  for (const path of paths) {
    const isDir = await isDirectory(path);

    const exportable: Exportable = isDir
      ? new Directory(path, exporter)
      : new File(path, exporter);

    await exportable.init();
  }
};
