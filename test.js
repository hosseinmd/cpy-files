import path from "path";
import fs from "fs";
import test from "ava";
import tempfile from "tempfile";
import execa from "execa";
import pathExists from "path-exists";

const read = (...args) => fs.readFileSync(path.join(...args), "utf8");

test.beforeEach((t) => {
  t.context.tmp = tempfile();
});

test("missing file operands", async (t) => {
  await t.throwsAsync(() => execa("./dist/cli.js"));
});

test("source file does not exist", async (t) => {
  await t.throwsAsync(() =>
    execa("./dist/cli.js", [
      path.join(t.context.tmp, "nonexistentfile"),
      t.context.tmp,
    ]),
  );
});

test("cwd", async (t) => {
  fs.mkdirSync(t.context.tmp);
  fs.mkdirSync(path.join(t.context.tmp, "cwd"));
  fs.writeFileSync(
    path.join(t.context.tmp, "cwd/hello.js"),
    'console.log("hello");',
  );
  try {
    await execa("./dist/cli.js", [
      "hello.js",
      "dest",
      "--cwd",
      path.join(t.context.tmp, "cwd"),
    ]);
  } catch (e) {
    console.log(e);
  }

  t.is(
    read(t.context.tmp, "cwd/hello.js"),
    read(t.context.tmp, "cwd/dest/hello.js"),
  );
});

test("keep path structure with flag `--parents`", async (t) => {
  fs.mkdirSync(t.context.tmp);
  fs.mkdirSync(path.join(t.context.tmp, "cwd"));
  fs.writeFileSync(
    path.join(t.context.tmp, "cwd/hello.js"),
    'console.log("hello");',
  );
  try {
    await execa("./dist/cli.js", [
      path.join(t.context.tmp, "cwd/hello.js"),
      t.context.tmp,
      "--parents",
    ]);
  } catch (e) {
    console.log(e);
  }
  t.is(
    read(t.context.tmp, "cwd/hello.js"),
    read(t.context.tmp, t.context.tmp, "cwd/hello.js"),
  );
});

test("rename filenames but not filepaths", async (t) => {
  fs.mkdirSync(t.context.tmp);
  fs.mkdirSync(path.join(t.context.tmp, "dest"));
  fs.writeFileSync(
    path.join(t.context.tmp, "hello.js"),
    'console.log("hello");',
  );
  try {
    await execa("./dist/cli.js", [
      path.join(t.context.tmp, "hello.js"),
      path.join(t.context.tmp, "dest"),
      "--rename=hi.js",
    ]);
  } catch (e) {
    console.log(e);
  }
  t.is(read(t.context.tmp, "hello.js"), read(t.context.tmp, "dest/hi.js"));
});

test("overwrite files by default", async (t) => {
  fs.mkdirSync(t.context.tmp);
  fs.mkdirSync(path.join(t.context.tmp, "dest"));
  fs.writeFileSync(
    path.join(t.context.tmp, "hello.js"),
    'console.log("hello");',
  );
  fs.writeFileSync(
    path.join(t.context.tmp, "dest/hello.js"),
    'console.log("world");',
  );
  try {
    await execa("./dist/cli.js", [
      path.join(t.context.tmp, "hello.js"),
      path.join(t.context.tmp, "dest"),
    ]);
  } catch (e) {
    console.log(e);
  }
  t.is(read(t.context.tmp, "dest/hello.js"), 'console.log("hello");');
});

test("do not copy files in the negated glob patterns", async (t) => {
  fs.mkdirSync(t.context.tmp);
  fs.mkdirSync(path.join(t.context.tmp, "src"));
  fs.mkdirSync(path.join(t.context.tmp, "dest"));
  fs.writeFileSync(
    path.join(t.context.tmp, "src/hello.js"),
    'console.log("hello");',
  );
  fs.writeFileSync(
    path.join(t.context.tmp, "src/hello.jsx"),
    'console.log("world");',
  );
  fs.writeFileSync(
    path.join(t.context.tmp, "src/hello.es2015"),
    'console.log("world");',
  );
  try {
    await execa("./dist/cli.js", [
      "src/*.*",
      "!src/*.jsx",
      "!src/*.es2015",
      "dest",
      "--cwd",
      t.context.tmp,
    ]);
  } catch (e) {
    console.log(e);
  }
  t.is(read(t.context.tmp, "dest/hello.js"), 'console.log("hello");');
  t.false(pathExists.sync(path.join(t.context.tmp, "dest/hello.jsx")));
  t.false(pathExists.sync(path.join(t.context.tmp, "dest/hello.es2015")));
});
