import { Exportable, File, Directory } from "./exportables";
import { getFileType } from "./utils";
import { FileType } from "./model";

export const parseFiles = async (files: string[]): Promise<Exportable[]> => {
  const exportables: Exportable[] = [];

  for (const file of files) {
    if (file.substring(0, file.lastIndexOf(".")).endsWith("/index")) continue;

    const fileType: FileType = await getFileType(file);
    const isDir = fileType === FileType.Directory;
    const exportable: Exportable = isDir ? new Directory() : new File();

    if (await exportable.init(file)) {
      exportables.push(exportable);
    }
  }

  return exportables;
};
