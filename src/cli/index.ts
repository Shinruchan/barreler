#!/usr/bin/env node
import meow from "meow";
import { barrel } from "../barreler";
import { BarrelerOptions } from "../barreler/model";

const cli = meow(
  `
    Usage
      $ barreler <input>
 
    Options
      --mode, -m  Select mode values = ['all-level-index', 'multifile-index'], Default: 'multifile-index'
 
    Examples
      $ barreler ./file.ts ./folder
`,
  {
    flags: {
      mode: {
        type: "string",
        alias: "m"
      }
    }
  }
);

const run = async (files: string[], flags: any) => {
  if (!files || files.length === 0) {
    cli.showHelp();
    return;
  }

  const options: BarrelerOptions = {
    mode: flags.mode
  };

  await barrel(files, options);

  console.log("Barreler finished.");
};

run(cli.input, cli.flags);
