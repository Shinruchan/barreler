import { FileType } from "../model";
import { compareFileExportsFirst, exportExportables } from "./exporter";
import { Exportable, File } from "../exportables";

describe("exporter", () => {
  describe("exportExportables", () => {
    it("should sort exportables", async () => {
      const exportables: Exportable[] = [];
      const sortSpy = jest.spyOn(exportables as any, "sort");

      await exportExportables(exportables);

      expect(sortSpy).toHaveBeenCalledWith(compareFileExportsFirst);
    });

    it("should write exportables to file", async () => {
      const exportable = new File();
      const writeSpy = jest
        .spyOn(exportable, "writeToFile")
        .mockResolvedValue();
      const exportables: Exportable[] = [exportable];

      await exportExportables(exportables);

      expect(writeSpy).toHaveBeenCalled();
    });
  });

  describe("compareFileExportsFirst", () => {
    const genExportable = (file: string, type: FileType) =>
      (({
        file,
        getType: () => type,
        getFile: () => file
      } as any) as Exportable);

    it("should put file exports first", () => {
      const file1 = genExportable("file 1", FileType.File);
      const file2 = genExportable("file 2", FileType.File);
      const dir1 = genExportable("dir 1", FileType.Directory);

      const exports = [file1, dir1, file2];

      expect(exports.sort(compareFileExportsFirst)).toEqual([
        file1,
        file2,
        dir1
      ]);
    });

    it("should sort by alphabet if same type", () => {
      const file1 = genExportable("b file 1", FileType.File);
      const file2 = genExportable("a file 2", FileType.File);
      const dir1 = genExportable("a dir 1", FileType.Directory);
      const dir2 = genExportable("b dir 1", FileType.Directory);

      const exports = [dir2, file1, dir1, file2];

      expect(exports.sort(compareFileExportsFirst)).toEqual([
        file2,
        file1,
        dir1,
        dir2
      ]);
    });
  });
});
