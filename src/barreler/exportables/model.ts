import { FileType } from "../model";

export interface Exportable {
  init(file: string): Promise<boolean>;
  writeToFile(): Promise<void>;
  getType(): FileType;
  getFile(): string;
}

export interface Export {
  name: string;
  isDefault?: boolean;
}
