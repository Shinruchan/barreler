import { Exportable, File, Directory } from "../exportables/index";
import { isDirectory } from "../util/index";
import { Exporter } from "../exporter/exporter";
import { BarrelerOptions } from "../model";

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
