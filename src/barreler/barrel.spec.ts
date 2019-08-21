import { barrel } from "./barrel";
import * as parser from "./parser/parser";
import { Exporter } from "./exporter/exporter";

describe("barrel", () => {
  it("should parse files", async () => {
    const parserSpy = jest.spyOn(parser, "parseFiles").mockResolvedValue();

    await barrel(["a", "b", "c"]);

    expect(parserSpy).toHaveBeenCalledWith(
      ["a", "b", "c"],
      expect.any(Exporter)
    );
  });

  it("should export exportables", async () => {
    const exporterSpy = jest.fn();
    Exporter.prototype.exportToFiles = exporterSpy;

    await barrel(["a", "b", "c"]);

    expect(exporterSpy).toHaveBeenCalled();
  });
});
