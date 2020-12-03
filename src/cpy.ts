/**
 * Copied form cpy repo
 */

"use strict";
import path from "path";
//@ts-ignore
import arrify from "arrify";
import globby from "globby";
//@ts-ignore
import hasGlob from "has-glob";
import cpFile from "cp-file";
import junk from "junk";

const defaultOptions = {
  ignoreJunk: true,
};

class SourceFile {
  path: string;
  relativePath: string;
  constructor(relativePath: string, path: string) {
    this.path = path;
    this.relativePath = relativePath;
    Object.freeze(this);
  }

  get name() {
    return path.basename(this.relativePath);
  }

  get nameWithoutExtension() {
    return path.basename(this.relativePath, path.extname(this.relativePath));
  }

  get extension() {
    return path.extname(this.relativePath).slice(1);
  }
}
interface Options {
  rename?: any;
  cwd?: any;
  parents?: any;
  ignoreJunk?: any;
  overwrite?: boolean;
  dot?: boolean;
}
const preprocessSourcePath = (source: string, options: Options) =>
  path.resolve(options.cwd ? options.cwd : process.cwd(), source);

const preprocessDestinationPath = (
  source: string,
  destination: string,
  options: Options,
) => {
  let basename = path.basename(source);

  if (typeof options.rename === "string") {
    basename = options.rename;
  } else if (typeof options.rename === "function") {
    basename = options.rename(basename);
  }

  if (options.cwd) {
    destination = path.resolve(options.cwd, destination);
  }

  if (options.parents) {
    const dirname = path.dirname(source);
    const parsedDirectory = path.parse(dirname);
    return path.join(
      destination,
      dirname.replace(parsedDirectory.root, path.sep),
      basename,
    );
  }

  return path.join(destination, basename);
};

export default (
  source: string | any[] | readonly string[],
  destination: any,
  options: Options = {},
) => {
  options = {
    ...defaultOptions,
    ...options,
  };

  source = arrify(source);

  if (source.length === 0 || !destination) {
    throw new Error("`source` and `destination` required");
  }

  let files;
  try {
    files = globby.sync(source, options);

    if (options.ignoreJunk) {
      files = files.filter((file) => junk.not(path.basename(file)));
    }
  } catch (error) {
    throw new Error(`Cannot glob \`${source}\`: ${error.message}`);
  }

  if (files.length === 0 && !hasGlob(source)) {
    throw new Error(`Cannot copy \`${source}\`: the file doesn't exist`);
  }

  const sources = files.map(
    (sourcePath) =>
      new SourceFile(sourcePath, preprocessSourcePath(sourcePath, options)),
  );

  sources.forEach((source) => {
    const to = preprocessDestinationPath(
      source.relativePath,
      destination,
      options,
    );

    try {
      cpFile.sync(source.path, to, options);
    } catch (error) {
      throw new Error(
        `Cannot copy from \`${source.relativePath}\` to \`${to}\`: ${error.message}`,
      );
    }

    return to;
  });
};
