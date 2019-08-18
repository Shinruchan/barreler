import { File } from "./file";
import * as utils from "../../util/utils";
import { FileType } from "../../model";

jest.mock("../../util/utils");

describe("File", () => {
  let file: File;

  beforeEach(() => {
    file = new File();
  });

  it("should be File type", () => {
    expect(file.getType()).toBe(FileType.File);
  });

  it("should return file path", () => {
    file["file"] = "file/path";

    expect(file.getFile()).toBe("file/path");
  });

  describe("init", () => {
    beforeEach(() => {
      file["hasValidExtension"] = jest.fn().mockReturnValue(true);
      file["preparePaths"] = jest.fn();
      file["findExportsInFile"] = jest.fn();
    });

    it("should validate file extension", async () => {
      file["hasValidExtension"] = jest.fn().mockReturnValue(false);

      const res = await file.init("");

      expect(file["hasValidExtension"]).toHaveBeenCalled();
      expect(res).toBe(false);
    });

    it("should prepare paths", async () => {
      const res = await file.init("");

      expect(file["preparePaths"]).toHaveBeenCalled();
      expect(res).toBe(true);
    });

    it("should find exports", async () => {
      const res = await file.init("");

      expect(file["findExportsInFile"]).toHaveBeenCalled();
      expect(res).toBe(true);
    });
  });

  describe("extension validator", () => {
    it("should allow .js", () => {
      file["file"] = "file.js";

      expect(file["hasValidExtension"]()).toBe(true);
    });

    it("should allow .jsx", () => {
      file["file"] = "file.jsx";

      expect(file["hasValidExtension"]()).toBe(true);
    });

    it("should allow .ts", () => {
      file["file"] = "file.ts";

      expect(file["hasValidExtension"]()).toBe(true);
    });

    it("should allow .tsx", () => {
      file["file"] = "file.tsx";

      expect(file["hasValidExtension"]()).toBe(true);
    });

    it("should not allow other", () => {
      file["file"] = "file.css";

      expect(file["hasValidExtension"]()).toBe(false);
    });
  });

  describe("findExportsInFile", () => {
    beforeEach(() => {
      file["findExportableNameFromLine"] = jest.fn();
    });

    it("should load file to string", async () => {
      file["file"] = "my-file.js";
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
    beforeEach(() => {
      file["file"] = "/project/folder/file.ts";

      file["preparePaths"]();
    });

    it("should set rootPath", () => {
      expect(file["rootPath"]).toEqual("/project/folder");
    });

    it("should set exportFromPath", () => {
      expect(file["exportFromPath"]).toEqual("/file");
    });

    it("should set indexFilePath", () => {
      expect(file["indexFilePath"]).toEqual("/project/folder/index.ts");
    });

    it("should set indexFilePath for js file", () => {
      file["file"] = "/project/folder/file.js";

      file["preparePaths"]();

      expect(file["indexFilePath"]).toEqual("/project/folder/index.js");
    });
  });

  describe("writeToFile", () => {
    let removeSpy: jest.SpyInstance;
    let appendSpy: jest.SpyInstance;

    beforeEach(() => {
      removeSpy = jest
        .spyOn(utils, "removeExportLinesBeforeUpdating")
        .mockImplementation();
      appendSpy = jest.spyOn(utils, "appendFile").mockImplementation();

      file["indexFilePath"] = "index.ts";
      file["exportFromPath"] = "/my-file";
    });

    it("should remove matching lines", async () => {
      await file.writeToFile();

      expect(removeSpy).toHaveBeenCalledWith("index.ts", "/my-file");
    });

    it("should append an export", async () => {
      file["exports"] = [{ name: "MyClass" }];

      await file.writeToFile();

      expect(appendSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { MyClass } from './my-file';\n"
      );
    });

    it("should append multiple exports", async () => {
      file["exports"] = [{ name: "MyClass" }, { name: "myConst" }];

      await file.writeToFile();

      expect(appendSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { MyClass, myConst } from './my-file';\n"
      );
    });

    it("should append default export", async () => {
      file["exports"] = [{ name: "MyClass", isDefault: true }];

      await file.writeToFile();

      expect(appendSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { default as MyClass } from './my-file';\n"
      );
    });
  });
});
