#!/usr/bin/env node

import { parseFiles, exportExportables } from "../barreler";

const run = async (files: string[]) => {
  const exportables = await parseFiles(files);
  await exportExportables(exportables);

  console.log("Barreler finished.");
};

run(process.argv.slice(2));
