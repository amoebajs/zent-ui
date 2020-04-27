const chokidar = require("chokidar");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");

function resolvePaths(paths) {
  return paths.map(i => path.resolve(__dirname, "..", ...i.split("/")));
}

// yaml修改触发源代码保存更改，可以自动激活watch
function runWatchEventTrick() {
  return new Promise((resolve, reject) => {
    const sourceRoot = path.resolve(__dirname, "compile.ts");
    fs.readFile(sourceRoot, { encoding: "utf8" }, (error, data) => {
      if (error) {
        return reject(error);
      }
      fs.writeFile(sourceRoot, data, { encoding: "utf8" }, err02 => {
        if (err02) {
          return reject(err02);
        }
        resolve();
      });
    });
  });
}

let watcher;

function fn(files) {
  console.log(chalk.yellow(`file changed --> ${files}`));
  watcher.removeListener("change", fn);
  runWatchEventTrick();
}

watcher = chokidar.watch(resolvePaths(["scripts/*.yaml", "scripts/*.json"]));
watcher.addListener("change", fn);
