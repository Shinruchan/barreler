import { parseFiles } from "./parser/parser.js";
import { Exporter } from "./exporter/exporter.js";
import { BarrelerOptions, BarrelerMode } from "./model.js";

export const defaultOptions: BarrelerOptions = {
  mode: BarrelerMode.MultiFileIndex,
  include: ["*.[jt]s(x)?"],
  exclude: ["*(spec|test).[jt]s(x)?", "*__tests__/*.[jt]s(x)?"],
};

export const barrel = async (
  files: string[],
  options?: Partial<BarrelerOptions>
): Promise<void> => {
  const opts: BarrelerOptions = {
    ...defaultOptions,
    ...options,
  };

  const exporter = new Exporter();
  await parseFiles(files, exporter, opts);
  await exporter.exportToFiles();
};
