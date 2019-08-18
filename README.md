# Barreler

Generator for barrel files (export from index files) for JavaScript and TypeScript.

**Features**

- Creates index files with all named exports from a file.
- Recursively creates index files for folder contents.

## Getting started

Install globally for command line usage:

```
npm install -g barreler
```

or locally:

```
npm install --save-dev barreler
```

## Usage

### Use from Command line

Run `barreler` with one or more files or directoreies:

```sh
barreler ./file.js ./file.js ./folder
```

### Use as npm dependency

Import `barrel` method and provide array of files or directories to barrel.

```ts
import { barrel } from "barreler";

await barrel(files);
```

## Use cases

## Generate index from single file

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

## Generate index from folder

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

## Limitations

Does not work on multiline or barrel exports.

```ts
const a;
const b;
const c;

export { a, b };
export c;
```

Would only export `c`.
