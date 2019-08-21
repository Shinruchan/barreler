import { ExportLine, Export } from "../exportables/model";
import {
  compareFileExportsFirst,
  compareAlphabetically,
  compareDefaultFirst
} from "./sort";

describe("sort", () => {
  describe("compareFileExportsFirst", () => {
    const genExportable = (fromFile: string, isDir: boolean) =>
      (({
        fromFile,
        whatToExport: isDir ? "" : {}
      } as any) as ExportLine);

    it("should put file exports first", () => {
      const file1 = genExportable("file 1", false);
      const file2 = genExportable("file 2", false);
      const dir1 = genExportable("dir 1", true);

      const exports = [file1, dir1, file2];

      expect(exports.sort(compareFileExportsFirst)).toEqual([
        file1,
        file2,
        dir1
      ]);
    });

    it("should sort by alphabet if same type", () => {
      const file1 = genExportable("b file 1", false);
      const file2 = genExportable("a file 2", false);
      const dir1 = genExportable("a dir 1", true);
      const dir2 = genExportable("b dir 1", true);

      const exports = [dir2, file1, dir1, file2];

      expect(exports.sort(compareFileExportsFirst)).toEqual([
        file2,
        file1,
        dir1,
        dir2
      ]);
    });
  });

  describe("compareAlphabetically", () => {
    it("should sort alphabetically", () => {
      const list = ["d", "a", "c"];

      expect(list.sort(compareAlphabetically)).toEqual(["a", "c", "d"]);
    });
  });

  describe("compareDefaultFirst", () => {
    it("should sort default first", () => {
      const list: Export[] = [
        { isDefault: true },
        { isDefault: false },
        { isDefault: true }
      ] as any[];

      expect(list.sort(compareDefaultFirst)).toEqual([
        { isDefault: true },
        { isDefault: true },
        { isDefault: false }
      ]);
    });
  });
});
