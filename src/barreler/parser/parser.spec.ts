import { parseFiles } from "./parser";
import { File, Directory } from "../exportables";
import * as utils from "../util";

describe("parser", () => {
  describe("parseFiles", () => {
    it("should parse files", async () => {
      jest.spyOn(utils, "isDirectory").mockResolvedValue(false);
      File.prototype.init = jest.fn().mockResolvedValue(true);

      await parseFiles(["./file.ts"], {} as any);

      expect(File.prototype.init).toHaveBeenCalled();
    });

    it("should parse directories", async () => {
      jest.spyOn(utils, "isDirectory").mockResolvedValue(true);
      Directory.prototype.init = jest.fn().mockResolvedValue(true);

      await parseFiles(["./dir"], {} as any);

      expect(Directory.prototype.init).toHaveBeenCalled();
    });
  });
});
