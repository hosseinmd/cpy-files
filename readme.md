# cpy-files

Source initialized from cpy-files 

> Copy files synchronize

## Install

```
$ npm install cpy-files 
```
or
```
$ yarn add cpy-files 
```

## Usage

```
$ cpy-files  --help

  Usage
    $ cpy-files  <source …> <destination>

  Options
    --no-overwrite       Don't overwrite the destination
    --parents            Preserve path structure
    --cwd=<dir>          Working directory for files
    --rename=<filename>  Rename all <source> filenames to <filename>
    --dot                Allow patterns to match entries that begin with a period (.)

  <source> can contain globs if quoted

  Examples
    Copy all .png files in src folder into dist except src/goat.png
    $ cpy-files  'src/*.png' '!src/goat.png' dist

    Copy all .html files inside src folder into dist and preserve path structure
    $ cpy-files  '**/*.html' '../dist/' --cwd=src --parents
```
