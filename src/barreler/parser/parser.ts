import { Exportable, File, Directory } from "../exportables/index.js";
import { isDirectory } from "../util/index.js";
import { Exporter } from "../exporter/exporter.js";
import { BarrelerOptions } from "../model.js";

export const parseFiles = async (
  paths: string[],
  exporter: Exporter,
  options: BarrelerOptions
): Promise<void> => {
  for (const path of paths) {
    const isDir = await isDirectory(path);

    const exportable: Exportable = isDir
      ? new Directory(path, exporter, options)
      : new File(path, exporter, options);

    await exportable.init();
  }
};
