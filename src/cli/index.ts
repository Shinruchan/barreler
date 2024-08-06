#!/usr/bin/env node
import meow from "meow";
import { barrel } from "../barreler/index";
import { BarrelerOptions } from "../barreler/model";

const cli = meow(
  `
    Usage
      $ barreler <input>
 
    Options
      --mode, -m      Select mode values = ['all-level-index', 'multifile-index'], Default: 'multifile-index'
      --include, -i   Sets pattern for file inclusion. Comma separated list. default: *.[jt]s(x)?
      --exclude, -e   Sets pattern for file exclusion. Comma separated list. default: *(spec|test).[jt]s(x)?,*__tests__/*.[jt]s(x)?
 
    Examples
      $ barreler ./file.ts ./folder
`,
  {
    flags: {
      mode: {
        type: "string",
        shortFlag: "m",
      },
      include: {
        type: "string",
        shortFlag: "i",
      },
      exclude: {
        type: "string",
        shortFlag: "e",
      },
    },
  }
);

const run = async (files: string[], flags: any) => {
  if (!files || files.length === 0) {
    cli.showHelp();
    return;
  }

  const options: Partial<BarrelerOptions> = {};

  if (flags.mode) options.mode = flags.mode;
  if (flags.include) options.include = flags.include.split(",");
  if (flags.exclude) options.exclude = flags.exclude.split(",");

  await barrel(files, options);

  console.log("Barreler finished.");
};

run(cli.input, cli.flags);
