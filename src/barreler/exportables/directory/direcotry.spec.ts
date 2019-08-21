import { Directory } from "./directory";
import { FileType } from "../../model";
import * as fs from "fs";
import * as parser from "../../parser/parser";
import * as exporter from "../../exporter/exporter";
import * as utils from "../../util/utils";

jest.mock("fs");
jest.mock("../../util/utils");
jest.mock("../../parser/parser");
jest.mock("../../exporter/exporter");

describe("Directory", () => {
  let directory: Directory;

  beforeEach(() => {
    directory = new Directory();
  });

  it("should be Directory type", () => {
    expect(directory.getType()).toBe(FileType.Directory);
  });

  it("should return file path", () => {
    directory["directory"] = "dir/dir";

    expect(directory.getFile()).toBe("dir/dir");
  });

  it("should get files in directory", async () => {
    directory["directory"] = "dir/dir";
    jest
      .spyOn(fs, "readdir")
      .mockImplementation((path, callback: any) =>
        callback(null, ["a.js", "b.js"])
      );

    const files = await directory["getFilesInDir"]();

    expect(files).toEqual(["dir/dir/a.js", "dir/dir/b.js"]);
  });

  describe("init", () => {
    it("should find exportables", async () => {
      directory["findExportsInDir"] = jest.fn();

      const res = await directory.init("");

      expect(directory["findExportsInDir"]).toHaveBeenCalled();
      expect(res).toBe(true);
    });
  });

  it("should parse all files in dir when finding exports", async () => {
    const mockDir = new Directory();
    directory["getFilesInDir"] = jest.fn().mockResolvedValue(["test.js"]);
    const parserSpy = jest
      .spyOn(parser, "parseFiles")
      .mockResolvedValue([mockDir]);

    await directory["findExportsInDir"]();

    expect(directory["getFilesInDir"]).toHaveBeenCalled();
    expect(parserSpy).toHaveBeenCalledWith(["test.js"]);
    expect(directory["exportables"]).toEqual([mockDir]);
  });

  describe("prepare paths", () => {
    beforeEach(async () => {
      directory["directory"] = "/project/folder";
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
    it("should js extension", async () => {
      directory["getFilesInDir"] = jest
        .fn()
        .mockResolvedValue(["style.css", "index.js", "file.ts"]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("js");
    });

    it("should js extension", async () => {
      directory["getFilesInDir"] = jest
        .fn()
        .mockResolvedValue(["style.css", "file.ts"]);

      const ext = await directory["getExtension"]();

      expect(ext).toBe("ts");
    });
  });

  describe("writeToFile", () => {
    let removeSpy: jest.SpyInstance;
    let appendSpy: jest.SpyInstance;
    let exporterSpy: jest.SpyInstance;

    beforeEach(() => {
      exporterSpy = jest
        .spyOn(exporter, "exportExportables")
        .mockImplementation();
      removeSpy = jest
        .spyOn(utils, "removeExportLinesBeforeUpdating")
        .mockImplementation();
      appendSpy = jest.spyOn(utils, "appendFile").mockImplementation();

      directory["preparePaths"] = jest.fn().mockResolvedValue(null);
      directory["hasIndex"] = jest.fn().mockResolvedValue(true);

      directory["indexFilePath"] = "index.ts";
      directory["exportFromPath"] = "/my-dir";
    });

    it("should prepare paths", async () => {
      await directory.writeToFile();

      expect(directory["hasIndex"]).toHaveBeenCalled();
    });

    it("should prepare paths", async () => {
      await directory.writeToFile();

      expect(directory["preparePaths"]).toHaveBeenCalled();
    });

    it("should export all underlaying exportables", async () => {
      await directory.writeToFile();

      expect(exporterSpy).toHaveBeenCalled();
    });

    it("should remove matching lines", async () => {
      await directory.writeToFile();

      expect(removeSpy).toHaveBeenCalledWith("index.ts", "/my-dir");
    });

    it("should append an export", async () => {
      await directory.writeToFile();

      expect(appendSpy).toHaveBeenCalledWith(
        "index.ts",
        "export * from './my-dir';\n"
      );
    });
  });

  describe("hasIndex", () => {
    it("should return true if has index", async () => {
      directory["getFilesInDir"] = jest.fn().mockResolvedValue(["/index.ts"]);

      expect(await directory["hasIndex"]()).toBe(true);
    });

    it("should return false if does not have index", async () => {
      directory["getFilesInDir"] = jest
        .fn()
        .mockResolvedValue(["/random-file.ts"]);

      expect(await directory["hasIndex"]()).toBe(false);
    });
  });
});
