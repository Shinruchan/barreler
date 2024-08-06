import * as utils from "./utils";
import * as fs from "fs";

jest.mock("fs");

describe("utils", () => {
  describe("isDirectory", () => {
    it("should get directory", async () => {
      jest.spyOn(fs, "stat").mockImplementation((path, callback: any) =>
        callback(null, {
          isDirectory: () => true,
        } as any)
      );

      const type = await utils.isDirectory("/dir");

      expect(type).toBe(true);
    });

    it("should get file", async () => {
      jest.spyOn(fs, "stat").mockImplementation((path, callback: any) =>
        callback(null, {
          isDirectory: () => false,
        } as any)
      );

      const type = await utils.isDirectory("/dir/file.ts");

      expect(type).toBe(false);
    });
  });

  it("should load file from fs", async () => {
    const readSpy = jest
      .spyOn(fs, "readFile")
      .mockImplementation((path, callback) =>
        callback(null, { toString: () => "test" } as any)
      );

    const file = await utils.loadFileToString("/file.ts");

    expect(file).toEqual("test");
    expect(readSpy).toHaveBeenCalledWith("/file.ts", expect.any(Function));
  });

  describe("removeExportLinesBeforeUpdating", () => {
    let writeFileSpy: jest.SpyInstance;

    beforeEach(() => {
      (utils as any).writeFile = jest.fn();
      writeFileSpy = jest.spyOn(utils, "writeFile").mockResolvedValue();
    });

    it("should load file", async () => {
      const loadSpy = jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue("");

      await utils.removeExportLinesBeforeUpdating("index-file.ts", "", false);

      expect(loadSpy).toHaveBeenCalledWith("index-file.ts");
    });

    it("should remove single line exports", async () => {
      jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue(
          "export { Dummy } from './dummy';\n" +
            "export * from './test';\n" +
            "export { DummyB } from './dummy.b;\n"
        );

      await utils.removeExportLinesBeforeUpdating("index.ts", "/test", false);

      expect(writeFileSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { Dummy } from './dummy';\n" +
          "export { DummyB } from './dummy.b;\n"
      );
    });

    it("should remove multi line exports", async () => {
      jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue(
          "export { Dummy } from './dummy';\n" +
            "export {\n" +
            "TestA," +
            "TestB," +
            "TestC," +
            "} from './test';\n" +
            "export { DummyB } from './dummy.b;\n"
        );

      await utils.removeExportLinesBeforeUpdating("index.ts", "/test", false);

      expect(writeFileSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { Dummy } from './dummy';\n" +
          "export { DummyB } from './dummy.b;\n"
      );
    });

    it("should remove type-only export and NOT remove non-type export", async () => {
      jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue(
          "export { Dummy } from './dummy';\n" +
            "export type {\n" +
            "TestA," +
            "TestB," +
            "TestC," +
            "} from './test';\n" +
            "export { TestD } from './test';\n" +
            "export { DummyB } from './dummy.b;\n"
        );

      await utils.removeExportLinesBeforeUpdating("index.ts", "/test", true);

      expect(writeFileSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { Dummy } from './dummy';\n" +
          "export { TestD } from './test';\n" +
          "export { DummyB } from './dummy.b;\n"
      );
    });

    it("should NOT remove type-only export and remove non-type export", async () => {
      jest
        .spyOn(utils, "loadFileToString")
        .mockResolvedValue(
          "export { Dummy } from './dummy';\n" +
            "export type { TestA } from './test';\n" +
            "export { TestD } from './test';\n" +
            "export { DummyB } from './dummy.b;\n"
        );

      await utils.removeExportLinesBeforeUpdating("index.ts", "/test", false);

      expect(writeFileSpy).toHaveBeenCalledWith(
        "index.ts",
        "export { Dummy } from './dummy';\n" +
          "export type { TestA } from './test';\n" +
          "export { DummyB } from './dummy.b;\n"
      );
    });
  });
});
