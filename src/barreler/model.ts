export enum BarrelerMode {
  AllLevelIndex = "all-level-index",
  MultiFileIndex = "multifile-index",
}

export enum BarrelerExtension {
  None = "none",
  SameAsFile = "same-as-file",
  Custom = "custom",
}

export interface BarrelerOptions {
  mode: BarrelerMode;
  extensions: BarrelerExtension;
  customExtension?: string;
  include: string[];
  exclude: string[];
}
