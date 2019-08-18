import { barrel } from "./barrel";
import * as parser from "./parser/parser";
import * as exporter from "./exporter/exporter";

describe("barrel", () => {
  it("should parse files", async () => {
    const parserSpy = jest.spyOn(parser, "parseFiles").mockResolvedValue([]);

    await barrel(["a", "b", "c"]);

    expect(parserSpy).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("should export exportables", async () => {
    const exporterSpy = jest
      .spyOn(exporter, "exportExportables")
      .mockResolvedValue();
    jest
      .spyOn(parser, "parseFiles")
      .mockResolvedValue(["exportable1", "exportable2"] as any[]);

    await barrel(["a", "b", "c"]);

    expect(exporterSpy).toHaveBeenCalledWith(["exportable1", "exportable2"]);
  });
});
