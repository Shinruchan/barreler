# Barreler

Generator for barrel files (export from index files) for JavaScript and TypeScript.

**Features**

- Creates index files with all named exports from a file.
- Recursively creates index files for folder contents.

### Getting started

Install globally for command line usage:

```
npm install -g barreler
```

or locally:

```
npm install --save-dev barreler
```

### Usage

#### Use from Command line

Run `barreler` with one or more files or directoreies:

```sh
barreler ./file.js ./file.js ./folder
```

Options:

```sh
--mode, -m          Select mode values = ['all-level-index', 'multifile-index'], Default: 'multifile-index'
--extensions, -ext  Selects mode how extensions will be rendered, values = ['none', 'same-as-file', 'custom'], Default: 'none'
                      - none, generates: export {} from './file'
                      - same-as-file, generates: export {} from './file.ts'
                      - custom, assuming --customExt=mjs generates: export {} from './file.mjs'
--customExt -ce     Sets extension for custom extension mode
--include, -i       Sets pattern for file inclusion. Comma separated list. default: *.[jt]s(x)?
--exclude, -e       Sets pattern for file exclusion. Comma separated list. default: *(spec|test).[jt]s(x)?,*__tests__/*.[jt]s(x)?,*__snapshots__/*
```

#### Use as npm dependency

Import `barrel` method and provide array of files or directories to barrel.

```ts
import { barrel } from "barreler";

await barrel(files, options?);
```

Options:

```ts
BarrelerOptions {
  mode: BarrelerMode; // default: BarrelerMode.MultiFileIndex
  extensions: BarrelerExtension; // default BarrelerExtension.None
  customExtension?: string; // only applicable when BarrelerExtension.Custom, set to something like 'js' or 'mjs', etc.
  include: string[];  // default: ["*.[jt]s(x)?"],
  exclude: string[];  // default: ["*(spec|test).[jt]s(x)?", "*__tests__/*.[jt]s(x)?", "*__snapshots__/*"]
}
```

### Modes

#### AllLevelIndex / all-level-index

Generates index file on file level and exports file exports into this index.

Example:

```

|-- index.ts <-- generated (export from: company.ts, /farm and /store)
|-- company.ts
|-- /services
|   |-- farm.service.ts
|   |-- index.ts <-- generated
|-- /store
|   |-- chicken.store.ts
|   |-- pig.store.ts
|   |-- index.ts <-- generated

```

#### MultiFileIndex / multifile-index (default)

Generates index file on lever where there is more than 1 file to export from.

This is default mode.

Example:

```
|-- index.ts <-- generated (export from: company.ts, farm.service.ts and /store)
|-- company.ts
|-- /services
|   |-- farm.service.ts
|-- /store
|   |-- chicken.store.ts
|   |-- pig.store.ts
|   |-- index.ts <-- generated
```

### Use cases

#### Generate index from single file

Structure:

```
|-- /services
|   |-- farm.service.ts
```

```ts
// farm.service.ts
export function feedAnimals() {}
export function cleanFarm() {}
```

Running `barreler ./services/farm.service.ts` would generate:

```
|-- /services
|   |-- farm.service.ts
|   |-- index.ts
```

```ts
// index.ts
export { feedAnimals, cleanFarm } from "./farm.service";
```

This would enable us to import any `farm.service` function directly from `/services`.

#### Generate index from folder

Structure:

```
|-- /services
|   |-- farm.service.ts
```

```ts
// farm.service.ts
export function feedAnimals() {}
export function cleanFarm() {}
```

Running `barreler ./services` would generate:

```
|-- /services
|   |-- farm.service.ts
|   |-- index.ts
|-- index.ts
```

```ts
// ./services/index.ts
export { feedAnimals, cleanFarm } from "./farm.service";
```

```ts
// ./index.ts
export * from "./services";
```

### Limitations

Does not work on multiline or barrel exports.

```ts
const a;
const b;
const c;

export { a, b };
export c;
```

Would only export `c`.
