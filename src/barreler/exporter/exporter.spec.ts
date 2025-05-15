import { Exporter } from "./exporter";
import * as util from "../util";
import { BarrelerExtension } from "../model";

jest.mock("../util");

describe("exporter", () => {
  let exporter: Exporter;

  beforeEach(() => {
    exporter = new Exporter({} as any);
  });

  describe("addExportsToIndex", () => {
    it("should add exports to new index file", () => {
      const exportLine = {
        whatToExport: "*",
        fromFile: "file",
        fromFileExtension: ".ts",
      };

      exporter.addExportsToIndex(exportLine, "/test/index.ts");

      const map = new Map();
      map.set("/test/index.ts", [exportLine]);

      expect(exporter["indexFiles"]).toEqual(map);
    });

    it("should add exports to existing index file", () => {
      exporter["indexFiles"] = new Map([
        [
          "/test/index.ts",
          [
            {
              whatToExport: "*",
              fromFile: "existing-file",
              fromFileExtension: ".ts",
            },
          ],
        ],
      ]);

      const exportLine = {
        whatToExport: "*",
        fromFile: "file.ts",
        fromFileExtension: ".ts",
      };

      exporter.addExportsToIndex(exportLine, "/test/index.ts");

      const map = new Map();
      map.set("/test/index.ts", [
        {
          whatToExport: "*",
          fromFile: "existing-file",
          fromFileExtension: ".ts",
        },
        exportLine,
      ]);

      expect(exporter["indexFiles"]).toEqual(map);
    });
  });

  describe("getIndexFiles", () => {
    it("should return index files", () => {
      exporter["indexFiles"] = new Map([
        [
          "/test/index.ts",
          [
            {
              whatToExport: "*",
              fromFile: "existing-file",
              fromFileExtension: ".ts",
            },
          ],
        ],
      ]);

      expect(exporter.getIndexFiles()).toEqual(["/test/index.ts"]);
    });
  });

  describe("exportToFiles", () => {
    beforeEach(() => {
      jest.spyOn(util, "compareFileExportsFirst").mockReturnValue(0);
    });

    it("should export string exports", async () => {
      exporter["exportStringLineToFile"] = jest.fn();

      exporter["indexFiles"] = new Map([
        [
          "index.ts",
          [
            {
              whatToExport: "*",
              fromFile: "/test",
              fromFileExtension: ".ts",
            },
          ],
        ],
      ]);

      await exporter.exportToFiles();

      expect(exporter["exportStringLineToFile"]).toHaveBeenCalledWith(
        { fromFile: "/test", whatToExport: "*", fromFileExtension: ".ts" },
        "index.ts"
      );
    });

    it("should export named exports", async () => {
      exporter["exportExportsLineToFile"] = jest.fn();

      exporter["indexFiles"] = new Map([
        [
          "index.ts",
          [
            {
              whatToExport: [{ name: "SomeEntity" }],
              fromFile: "/file",
              fromFileExtension: ".ts",
            },
          ],
        ],
      ]);

      await exporter.exportToFiles();

      expect(exporter["exportExportsLineToFile"]).toHaveBeenCalledWith(
        {
          fromFile: "/file",
          whatToExport: [{ name: "SomeEntity" }],
          fromFileExtension: ".ts",
        },
        "index.ts"
      );
    });

    it("should sort export lines", async () => {
      exporter["indexFiles"] = new Map([
        [
          "index.ts",
          [
            {
              whatToExport: "*",
              fromFile: "/test",
              fromFileExtension: ".ts",
            },
            {
              whatToExport: "*",
              fromFile: "/test2",
              fromFileExtension: ".ts",
            },
          ],
        ],
      ]);

      await exporter.exportToFiles();

      expect(util.compareFileExportsFirst).toHaveBeenCalled();
    });
  });

  describe("exportStringLineToFile", () => {
    beforeEach(() => {
      jest.spyOn(util, "removeExportLinesBeforeUpdating").mockImplementation();
      jest.spyOn(util, "appendFile").mockImplementation();
    });

    it("should remove existing line", async () => {
      await exporter["exportStringLineToFile"](
        {
          whatToExport: "*",
          fromFile: "/folder/file",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.removeExportLinesBeforeUpdating).toHaveBeenCalledWith(
        "some/index.ts",
        "/folder/file",
        false
      );
    });

    it("should write * export to file", async () => {
      await exporter["exportStringLineToFile"](
        {
          whatToExport: "*",
          fromFile: "/folder/file",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.appendFile).toHaveBeenCalledWith(
        "some/index.ts",
        "export * from './folder/file';\n"
      );
    });
  });

  describe("exportExportsLineToFile", () => {
    beforeEach(() => {
      jest.spyOn(util, "removeExportLinesBeforeUpdating").mockImplementation();
      jest.spyOn(util, "appendFile").mockImplementation();
      jest.spyOn(util, "compareAlphabetically").mockReturnValue(0);
      jest.spyOn(util, "compareDefaultFirst").mockReturnValue(0);
    });

    it("should remove existing line", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [{ name: "SomeEntity" }],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.removeExportLinesBeforeUpdating).toHaveBeenCalledWith(
        "some/index.ts",
        "/folder/file.ts",
        false
      );
    });

    it("should remove existing line with type-only export", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [{ name: "SomeEntity", isType: true }],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.removeExportLinesBeforeUpdating).toHaveBeenCalledWith(
        "some/index.ts",
        "/folder/file.ts",
        true
      );
    });

    it("should write exports to file", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [{ name: "SomeEntity" }],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.appendFile).toHaveBeenCalledWith(
        "some/index.ts",
        "export { SomeEntity } from './folder/file.ts';\n"
      );
    });

    it("should write default exports to file", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [
            { name: "SomeEntity" },
            { name: "SomeDefEntity", isDefault: true },
          ],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.appendFile).toHaveBeenCalledWith(
        "some/index.ts",
        "export { SomeEntity, default as SomeDefEntity } from './folder/file.ts';\n"
      );
    });

    it("should write type-only exports to file", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [{ name: "SomeEntity", isType: true }],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.appendFile).toHaveBeenCalledWith(
        "some/index.ts",
        "export type { SomeEntity } from './folder/file.ts';\n"
      );
    });

    it("should sort alphabetically", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [{ name: "SomeEntity1" }, { name: "SomeEntity2" }],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.compareAlphabetically).toHaveBeenCalled();
    });

    it("should sort defaults first", async () => {
      await exporter["exportExportsLineToFile"](
        {
          whatToExport: [{ name: "SomeEntity1" }, { name: "SomeEntity2" }],
          fromFile: "/folder/file.ts",
          fromFileExtension: ".ts",
        },
        "some/index.ts"
      );

      expect(util.compareDefaultFirst).toHaveBeenCalled();
    });
  });

  describe("getExtension", () => {
    it("should return none for None", () => {
      exporter["options"]["extensions"] = BarrelerExtension.None;

      const ext = exporter["getExtension"]({
        whatToExport: "*",
        fromFile: "./file",
        fromFileExtension: ".ts",
      });

      expect(ext).toBe("");
    });

    it("should return .ts for SameAsFile", () => {
      exporter["options"]["extensions"] = BarrelerExtension.SameAsFile;

      const ext = exporter["getExtension"]({
        whatToExport: "*",
        fromFile: "./file",
        fromFileExtension: ".ts",
      });

      expect(ext).toBe(".ts");
    });

    it("should return .js for SameAsFile", () => {
      exporter["options"]["extensions"] = BarrelerExtension.SameAsFile;

      const ext = exporter["getExtension"]({
        whatToExport: "*",
        fromFile: "./file",
        fromFileExtension: ".js",
      });

      expect(ext).toBe(".js");
    });

    it("should return .mjs for Custom", () => {
      exporter["options"]["extensions"] = BarrelerExtension.Custom;
      exporter["options"]["customExtension"] = "mjs";

      const ext = exporter["getExtension"]({
        whatToExport: "*",
        fromFile: "./file",
        fromFileExtension: ".js",
      });

      expect(ext).toBe(".mjs");
    });
  });
});
