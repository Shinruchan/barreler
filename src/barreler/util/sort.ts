import { ExportLine, Export } from "../exportables/model.js";

export const compareFileExportsFirst = (exp1: ExportLine, exp2: ExportLine) => {
  if (
    typeof exp1.whatToExport === "string" &&
    typeof exp2.whatToExport !== "string"
  ) {
    return 1;
  }
  if (
    typeof exp1.whatToExport !== "string" &&
    typeof exp2.whatToExport === "string"
  ) {
    return -1;
  }
  return compareAlphabetically(exp1.fromFile, exp2.fromFile);
};

export const compareAlphabetically = (file1: string, file2: string) => {
  if (file1 < file2) return -1;
  if (file1 > file2) return 1;
  return 0;
};

export const compareDefaultFirst = (exp1: Export, exp2: Export) => {
  if (!exp1.isDefault && exp2.isDefault) return 1;
  if (exp1.isDefault && !exp2.isDefault) return -1;
  return 0;
};
