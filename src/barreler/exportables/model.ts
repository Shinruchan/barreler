import { Exporter } from "../exporter/exporter";

export abstract class Exportable {
  constructor(protected path: string, protected exporter: Exporter) {}

  abstract init(): Promise<void>;
}

export interface Export {
  name: string;
  isDefault?: boolean;
}

export interface ExportLine {
  whatToExport: string | Export[];
  fromFile: string;
}
