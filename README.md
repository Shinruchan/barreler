# Barreler

Generator for barrel files (export from index files) for JavaScript and TypeScript.

## Use as CLI

Install package and run `barreler` command with one or more files or directories.

```
npm install -g barreler
```

```sh
barreler ./file.js ./file.js ./folder
```

## Use as npm dependency

```
npm install barreler
```

```ts
import { parseFiles, exportExportables } from "barreler";

// Generate exportables
const exportables = await parseFiles(files);

// Export them to index files
await exportExportables(exportables);
```
