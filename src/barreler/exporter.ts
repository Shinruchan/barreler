import { Exportable } from "./exportables";
import { FileType } from "./model";

export const exportExportables = async (
  exportables: Exportable[]
): Promise<void> => {
  const sorted = exportables.sort(compareFileExportsFirst);

  for (const exportable of sorted) {
    await exportable.writeToFile();
  }
};

export const compareFileExportsFirst = (exp1: Exportable, exp2: Exportable) => {
  if (
    exp1.getType() === FileType.Directory &&
    exp2.getType() === FileType.File
  ) {
    return 1;
  }
  if (
    exp1.getType() === FileType.File &&
    exp2.getType() === FileType.Directory
  ) {
    return -1;
  }
  return compareAlphabetically(exp1.getFile(), exp2.getFile());
};

export const compareAlphabetically = (file1: string, file2: string) => {
  if (file1 < file2) return -1;
  if (file1 > file2) return 1;
  return 0;
};
