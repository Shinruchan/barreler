import { Directory } from "./directory";
import * as fs from "fs";
import * as parser from "../../parser/parser";
import * as exporter from "../../exporter/exporter";
import * as utils from "../../util/utils";

jest.mock("fs");
jest.mock("../../util/utils");
jest.mock("../../parser/parser");
jest.mock("../../exporter/exporter");

describe("Directory", () => {
  let exporter: exporter.Exporter;
  let directory: Directory;

  beforeEach(() => {
    exporter = {
      addExportsToIndex: jest.fn(),
      exportToFiles: jest.fn().mockResolvedValue(null),
      getIndexFiles: jest.fn()
    } as any;

    directory = new Directory("", exporter);
  });

  it("should get files in directory", async () => {
    directory["path"] = "dir/dir";
    jest
      .spyOn(fs, "readdir")
      .mockImplementation((path, callback: any) =>
        callback(null, ["a.js", "b.js"])
      );

    const files = await directory["getFilesInDir"]();

    expect(files).toEqual(["dir/dir/a.js", "dir/dir/b.js"]);
  });

  describe("init", () => {
    beforeEach(() => {
      directory["findExportsInDir"] = jest.fn();
      directory["hasIndex"] = jest.fn().mockResolvedValue(true);
      directory["preparePaths"] = jest.fn();
      directory["exportToExporter"] = jest.fn();
    });

    it("should find exportables", async () => {
      await directory.init();

      expect(directory["findExportsInDir"]).toHaveBeenCalled();
    });

    it("should check for index", async () => {
      await directory.init();

      expect(directory["hasIndex"]).toHaveBeenCalled();
    });

    it("should prepare paths", async () => {
      await directory.init();

      expect(directory["preparePaths"]).toHaveBeenCalled();
    });

    it("should export exports", async () => {
      await directory.init();

      expect(directory["exportToExporter"]).toHaveBeenCalled();
    });
  });

  describe("export to exporter", () => {
    it("should export exports via exporter", () => {
      directory["exportFromPath"] = "fromPath";
      directory["indexFilePath"] = "indexPath";

      directory["exportToExporter"]();

      expect(exporter.addExportsToIndex).toHaveBeenCalledWith(
        {
          whatToExport: "*",
          fromFile: "fromPath"
        },
        "indexPath"
      );
    });
  });

  it("should parse all files in dir when finding exports", async () => {
    directory["getFilesInDir"] = jest.fn().mockResolvedValue(["test.js"]);
    const parserSpy = jest.spyOn(parser, "parseFiles").mockResolvedValue();

    await directory["findExportsInDir"]();

    expect(directory["getFilesInDir"]).toHaveBeenCalled();
    expect(parserSpy).toHaveBeenCalledWith(["test.js"], exporter);
  });

  describe("prepare paths", () => {
    beforeEach(async () => {
      directory["path"] = "/project/folder";
      directory["getExtension"] = jest.fn().mockResolvedValue("ts");

      await directory["preparePaths"]();
    });

    it("should set exportFromPath", () => {
      expect(directory["exportFromPath"]).toEqual("/folder");
    });

    it("should set indexFilePath", () => {
      expect(directory["getExtension"]).toHaveBeenCalled();
      expect(directory["indexFilePath"]).toEqual("/project/index.ts");
    });
  });

  describe("getExtension", () => {
    it("should return js extension", async () => {
      directory["getFilesInDir"] = jest
        .fn()
        .mockResolvedValue(["style.css", "index.js", "file.ts"]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("js");
    });

    it("should return ts extension", async () => {
      directory["getFilesInDir"] = jest
        .fn()
        .mockResolvedValue(["style.css", "file.ts"]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("ts");
    });

    it("should return ts extension if not yet created files exist", async () => {
      directory["getFilesInDir"] = jest.fn().mockResolvedValue([]);
      jest.spyOn(exporter, "getIndexFiles").mockReturnValue(["/index.ts"]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("ts");
    });

    it("should return js extension if not yet created files exist", async () => {
      directory["getFilesInDir"] = jest.fn().mockResolvedValue([]);
      jest.spyOn(exporter, "getIndexFiles").mockReturnValue(["/index.js"]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("js");
    });

    it("should return default js if no files exist", async () => {
      directory["getFilesInDir"] = jest.fn().mockResolvedValue([]);
      jest.spyOn(exporter, "getIndexFiles").mockReturnValue([]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("js");
    });
  });

  describe("hasIndex", () => {
    it("should return true if has index", async () => {
      jest.spyOn(exporter, "getIndexFiles").mockReturnValue(["/index.ts"]);

      expect(await directory["hasIndex"]()).toBe(true);
    });

    it("should return false if does not have index", async () => {
      jest
        .spyOn(exporter, "getIndexFiles")
        .mockReturnValue(["/random-file.ts"]);

      expect(await directory["hasIndex"]()).toBe(false);
    });
  });
});
