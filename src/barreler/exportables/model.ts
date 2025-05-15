import { Exporter } from "../exporter/exporter";
import { BarrelerOptions } from "../model";

export abstract class Exportable {
  constructor(
    protected path: string,
    protected exporter: Exporter,
    protected options: BarrelerOptions
  ) {}

  abstract init(): Promise<void>;
}

export interface Export {
  name: string;
  isDefault?: boolean;
  isType?: boolean;
}

export interface ExportLine {
  whatToExport: string | Export[];
  fromFile: string;
  fromFileExtension: string;
}
