import { FileType } from "../model";
import { parseFiles } from "./parser";
import { File, Directory } from "../exportables";
import * as utils from "../util/utils";

describe("parser", () => {
  describe("parseFiles", () => {
    it("should ignore index files", async () => {
      const exportables = await parseFiles(["./index.ts", "./index.js"]);

      expect(exportables.length).toBe(0);
    });

    it("should parse files", async () => {
      jest.spyOn(utils, "getFileType").mockResolvedValue(FileType.File);
      File.prototype.init = jest.fn().mockResolvedValue(true);

      const exportables = await parseFiles(["./file.ts"]);

      expect(File.prototype.init).toHaveBeenCalledWith("./file.ts");
      expect(exportables.length).toBe(1);
    });

    it("should parse directories", async () => {
      jest.spyOn(utils, "getFileType").mockResolvedValue(FileType.Directory);
      Directory.prototype.init = jest.fn().mockResolvedValue(true);

      const exportables = await parseFiles(["./dir"]);

      expect(Directory.prototype.init).toHaveBeenCalledWith("./dir");
      expect(exportables.length).toBe(1);
    });
  });
});
