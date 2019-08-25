import * as fs from "fs";
import { File } from "./file";
import * as utils from "../../util/utils";
import { Exporter } from "../../exporter/exporter";

jest.mock("../../util/utils");
jest.mock("fs");

describe("File", () => {
  let file: File;
  let exporter: Exporter;

  beforeEach(() => {
    exporter = {
      addExportsToIndex: jest.fn(),
      exportToFiles: jest.fn().mockResolvedValue(null)
    } as any;

    file = new File("my-file.js", exporter, {
      include: ["include"],
      exclude: ["exclude"]
    } as any);
  });

  describe("init", () => {
    beforeEach(() => {
      jest
        .spyOn(utils, "isMachedPath")
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      file["isIndex"] = jest.fn();
      file["preparePaths"] = jest.fn().mockResolvedValue(null);
      file["findExportsInFile"] = jest.fn().mockResolvedValue(null);
      file["exportExports"] = jest.fn().mockResolvedValue(null);
    });

    it("should validate file exclusion", async () => {
      await file.init();

      expect(utils.isMachedPath).toHaveBeenCalledWith("my-file.js", [
        "exclude"
      ]);
    });

    it("should validate file inclusion", async () => {
      await file.init();

      expect(utils.isMachedPath).toHaveBeenCalledWith("my-file.js", [
        "include"
      ]);
    });

    it("should validate index file", async () => {
      await file.init();

      expect(file["isIndex"]).toHaveBeenCalled();
    });

    it("should prepare paths", async () => {
      await file.init();

      expect(file["preparePaths"]).toHaveBeenCalled();
    });

    it("should find exports", async () => {
      await file.init();

      expect(file["findExportsInFile"]).toHaveBeenCalled();
    });

    it("should export exports", async () => {
      await file.init();

      expect(file["exportExports"]).toHaveBeenCalled();
    });
  });

  describe("export exports", () => {
    it("should export exports via exporter", () => {
      file["exports"] = ["a"] as any;
      file["exportFromPath"] = "fromPath";
      file["indexFilePath"] = "indexPath";

      file["exportExports"]();

      expect(exporter.addExportsToIndex).toHaveBeenCalledWith(
        {
          whatToExport: ["a"],
          fromFile: "fromPath"
        },
        "indexPath"
      );
    });
  });

  describe("is index", () => {
    it("should return true if index.ts", () => {
      file["path"] = "some/path/to/index.ts";

      expect(file["isIndex"]()).toBe(true);
    });

    it("should return true if index.js", () => {
      file["path"] = "path/index.js";

      expect(file["isIndex"]()).toBe(true);
    });

    it("should return false if normal file", () => {
      file["path"] = "/some/normal/file.ts";

      expect(file["isIndex"]()).toBe(false);
    });
  });

  describe("findExportsInFile", () => {
    beforeEach(() => {
      file["findExportableNameFromLine"] = jest.fn();
    });

    it("should load file to string", async () => {
      file["path"] = "my-file.js";
      const loadSpy = jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue("");

      await file["findExportsInFile"]();

      expect(loadSpy).toHaveBeenCalledWith("my-file.js");
    });

    it("should find export line", async () => {
      jest.spyOn(utils, "loadFileToString").mockResolvedValue(`
            export class Test {

            }

            const val = 0;
        `);

      await file["findExportsInFile"]();

      expect(file["findExportableNameFromLine"]).toHaveBeenCalledWith(
        "            export class Test {"
      );
      expect(file["findExportableNameFromLine"]).toHaveBeenCalledTimes(1);
    });

    it("should find multiple export lines", async () => {
      jest.spyOn(utils, "loadFileToString").mockResolvedValue(`
              export class Test {
  
              }

              // do not do this line
  
              export const val = 0;
          `);

      await file["findExportsInFile"]();

      expect(file["findExportableNameFromLine"]).toHaveBeenNthCalledWith(
        1,
        "              export class Test {"
      );
      expect(file["findExportableNameFromLine"]).toHaveBeenNthCalledWith(
        2,
        "              export const val = 0;"
      );
      expect(file["findExportableNameFromLine"]).toHaveBeenCalledTimes(2);
    });

    it("should add exports to exports list", async () => {
      jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue("export class Test {}");
      file["findExportableNameFromLine"] = jest.fn().mockReturnValue({
        name: "Test"
      });

      await file["findExportsInFile"]();

      expect(file["exports"]).toEqual([{ name: "Test" }]);
    });
  });

  describe("findExportableNameFromLine", () => {
    it("should find interface", () => {
      const exp = file["findExportableNameFromLine"](
        "export interface MyInterface {}"
      );

      expect(exp!.name).toEqual("MyInterface");
    });

    it("should find const", () => {
      const exp = file["findExportableNameFromLine"](
        "export const CONST_VALUE = 34;"
      );

      expect(exp!.name).toEqual("CONST_VALUE");
    });

    it("should find var", () => {
      const exp = file["findExportableNameFromLine"](
        "export var number_regexp = /^[0-9]+$/;"
      );

      expect(exp!.name).toEqual("number_regexp");
    });

    it("should find let", () => {
      const exp = file["findExportableNameFromLine"](
        "export let numberRegexp = /^[0-9]+$/;"
      );

      expect(exp!.name).toEqual("numberRegexp");
    });

    it("should find class", () => {
      const exp = file["findExportableNameFromLine"]("export class MyClass {}");

      expect(exp!.name).toEqual("MyClass");
    });

    it("should find abstract class", () => {
      const exp = file["findExportableNameFromLine"](
        "export abstract class MyClass {}"
      );

      expect(exp!.name).toEqual("MyClass");
    });

    it("should find class that extends different class", () => {
      const exp = file["findExportableNameFromLine"](
        "export class MyClass extends AbsClass {}"
      );

      expect(exp!.name).toEqual("MyClass");
    });

    it("should find class that implements", () => {
      const exp = file["findExportableNameFromLine"](
        "export class MyClass implements Interface {}"
      );

      expect(exp!.name).toEqual("MyClass");
    });

    it("should find class that extends and implements", () => {
      const exp = file["findExportableNameFromLine"](
        "export class MyClass extends AbsClass implements Interface {}"
      );

      expect(exp!.name).toEqual("MyClass");
    });

    it("should find class with generics", () => {
      const exp = file["findExportableNameFromLine"](
        "export class Generic<T extends MyDefClass> {}"
      );

      expect(exp!.name).toEqual("Generic");
    });

    it("should find function", () => {
      const exp = file["findExportableNameFromLine"](
        "export function myFunction() {}"
      );

      expect(exp!.name).toEqual("myFunction");
    });

    it("should find function with generics", () => {
      const exp = file["findExportableNameFromLine"](
        "export function myFunction<T>() {}"
      );

      expect(exp!.name).toEqual("myFunction");
    });

    it("should find arrow function", () => {
      const exp = file["findExportableNameFromLine"](
        "export const myArrow = () => {}"
      );

      expect(exp!.name).toEqual("myArrow");
    });

    describe("isDefault", () => {
      it("should find non-default export", () => {
        const exp = file["findExportableNameFromLine"](
          "export class MyNonDefaultClass {"
        );

        expect(exp).toEqual({
          name: "MyNonDefaultClass",
          isDefault: false
        });
      });

      it("should find default export", () => {
        const exp = file["findExportableNameFromLine"](
          "export default class MyDefaultClass {"
        );

        expect(exp).toEqual({
          name: "MyDefaultClass",
          isDefault: true
        });
      });
    });

    it("should not remove reserved words from names", () => {
      const exp = file["findExportableNameFromLine"](
        "export const exportConstExample = 10;"
      );

      expect(exp!.name).toEqual("exportConstExample");
    });
  });

  describe("prepare paths", () => {
    beforeEach(async () => {
      file["path"] = "/project/folder/file.ts";
      file["getRootPath"] = jest.fn(() => Promise.resolve("/project/folder"));

      await file["preparePaths"]();
    });

    it("should set rootPath", () => {
      expect(file["getRootPath"]).toHaveBeenCalledWith(file["path"]);
    });

    it("should set exportFromPath", () => {
      expect(file["exportFromPath"]).toEqual("/file");
    });

    it("should set indexFilePath", () => {
      expect(file["indexFilePath"]).toEqual("/project/folder/index.ts");
    });

    it("should set indexFilePath for js file", async () => {
      file["path"] = "/project/folder/file.js";

      await file["preparePaths"]();

      expect(file["indexFilePath"]).toEqual("/project/folder/index.js");
    });
  });

  describe("get root path", () => {
    it("should be same folder if file has sibilings", async () => {
      file["hasSibilings"] = jest.fn().mockResolvedValue(true);

      const path = await file["getRootPath"]("/some/path/file.ts");

      expect(path).toBe("/some/path");
    });

    it("should be parent folder if file has no direct sibilings", async () => {
      file["hasSibilings"] = jest
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValue(true);

      const path = await file["getRootPath"]("/some/path/file.ts");

      expect(path).toBe("/some");
    });
  });

  describe("hasSibilings", () => {
    const setFiles = (files: string[]) => {
      jest
        .spyOn(fs, "readdir")
        .mockImplementation((path, opts, callback) =>
          callback(null, files as any)
        );
    };

    it("should be true if include included file sibiling", async () => {
      jest
        .spyOn(utils, "isMachedPath")
        .mockReturnValueOnce(false) // target file is not excluded
        .mockReturnValueOnce(true) // target file is included
        .mockReturnValueOnce(false) // sibiling is not excluded
        .mockReturnValueOnce(true); // sibiling is included

      setFiles(["my-file.ts", "file.ts"]);

      expect(await file["hasSibilings"]("dir")).toBe(true);
    });

    it("should be false if include only non-exportable sibiling", async () => {
      jest
        .spyOn(utils, "isMachedPath")
        .mockReturnValueOnce(false) // target file is not excluded
        .mockReturnValueOnce(true) // target file is included
        .mockReturnValueOnce(false) // sibiling is not excluded
        .mockReturnValueOnce(false); // sibiling is not included

      setFiles(["my-file.ts", "file.css"]);

      expect(await file["hasSibilings"]("dir")).toBe(false);
    });

    it("should be false if sibiling is excluded", async () => {
      jest
        .spyOn(utils, "isMachedPath")
        .mockReturnValueOnce(false) // target file is not excluded
        .mockReturnValueOnce(true) // target file is included
        .mockReturnValueOnce(true); // sibiling is excluded

      setFiles(["my-file.ts", "file.spec.ts"]);

      expect(await file["hasSibilings"]("dir")).toBe(false);
    });

    it("should be true if include folder sibiling", async () => {
      jest
        .spyOn(utils, "isMachedPath")
        .mockReturnValueOnce(false) // target file is not excluded
        .mockReturnValueOnce(true) // target file is included
        .mockReturnValueOnce(false) // sibiling is not excluded
        .mockReturnValueOnce(false); // sibiling is not included

      setFiles(["my-file.ts", "folder"]);

      expect(await file["hasSibilings"]("dir")).toBe(true);
    });

    it("should be true if include folder-with-dash sibiling", async () => {
      jest
        .spyOn(utils, "isMachedPath")
        .mockReturnValueOnce(false) // target file is not excluded
        .mockReturnValueOnce(true) // target file is included
        .mockReturnValueOnce(false) // sibiling is not excluded
        .mockReturnValueOnce(false); // sibiling is not included

      setFiles(["my-file.ts", "folder-with-dash"]);

      expect(await file["hasSibilings"]("dir")).toBe(true);
    });
  });
});
