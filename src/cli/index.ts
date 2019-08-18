#!/usr/bin/env node

import { barrel } from "../barreler";

const run = async (files: string[]) => {
  await barrel(files);

  console.log("Barreler finished.");
};

run(process.argv.slice(2));
