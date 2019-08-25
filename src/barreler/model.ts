export enum BarrelerMode {
  AllLevelIndex = "all-level-index",
  MultiFileIndex = "multifile-index"
}

export interface BarrelerOptions {
  mode: BarrelerMode;
  include: string[];
  exclude: string[];
}
