#!/usr/bin/env node
/**
 * Copied from cpy-cli
 */
"use strict";
import meow from "meow";
import cpy from "cpy";

const cli = meow(
  `
	Usage
	  $ cpy-sync <source …> <destination>

	Options
	  --no-overwrite       Don't overwrite the destination
	  --parents            Preserve path structure
	  --cwd=<dir>          Working directory for files
	  --rename=<filename>  Rename all <source> filenames to <filename>
	  --dot                Allow patterns to match entries that begin with a period (.)

	<source> can contain globs if quoted

	Examples
	  Copy all .png files in src folder into dist except src/goat.png
	  $ cpy-sync 'src/*.png' '!src/goat.png' dist

	  Copy all .html files inside src folder into dist and preserve path structure
	  $ cpy-sync '**/*.html' '../dist/' --cwd=src --parents
`,
  {
    flags: {
      overwrite: {
        type: "boolean",
        default: true,
      },
      parents: {
        type: "boolean",
        default: false,
      },
      cwd: {
        type: "string",
        default: process.cwd(),
      },
      rename: {
        type: "string",
      },
      dot: {
        type: "boolean",
        default: false,
      },
    },
  },
);

try {
  cpy(cli.input, cli.input.pop() || "", {
    cwd: cli.flags.cwd,
    rename: cli.flags.rename,
    parents: cli.flags.parents,
    overwrite: cli.flags.overwrite,
    dot: cli.flags.dot,
  });
} catch (error) {
  if (error.name === "CpyError") {
    console.error(error.message);
    process.exit(1);
  } else {
    throw error;
  }
}
