import "./watch-config";
import * as fs from "fs";
import * as path from "path";
import jsyaml from "js-yaml";
import chalk from "chalk";
import { Factory } from "@amoebajs/builder";
import { CommonModule, LayoutModule, ZentModule, CompositionModule } from "../src";

const openfile = process.argv.find(i => i.startsWith("--open=")) || "--open=layout.yaml";
const format = process.argv.find(i => i.startsWith("--format=")) || "--format=false";
const filemode = process.argv.find(i => i.startsWith("--mode=")) || "--mode=ts";

const demoConf = jsyaml.load(
  fs
    .readFileSync(path.resolve(__dirname, (openfile.endsWith(".yaml") ? openfile : openfile + ".yaml").slice(7)))
    .toString(),
);

const buildFolder = path.resolve(process.cwd(), "build");

if (!fs.existsSync(buildFolder)) fs.mkdirSync(buildFolder);

const buildSrcFolder = path.resolve(process.cwd(), "build", "src");

if (!fs.existsSync(buildSrcFolder)) fs.mkdirSync(buildSrcFolder);

const outDir = path.resolve(process.cwd(), "build", "src");

const startTime = new Date().getTime();

const filetype = filemode.slice(7);

// const MAIN = "main.jsx";
const MAIN = `main.${filetype}x`;

// new Factory().builder
const builder = new Factory()
  .useModule(CommonModule)
  .useModule(LayoutModule)
  .useModule(CompositionModule)
  .useModule(ZentModule).builder;
// console.log(JSON.stringify(demoConf, null, 2));
// console.log(JSON.stringify(builder["globalMap"].maps, null, "  "));
builder
  .createSource({
    configs: demoConf,
    prettier: format.slice(9) === "true",
    transpile: { enabled: filetype === "js", target: "es2015", module: "es2015", jsx: "react" },
  })
  .then(({ sourceCode, dependencies }) => {
    const endTime = new Date().getTime() - startTime;
    console.log("cost : " + endTime + "ms");
    fs.writeFileSync(path.resolve(outDir, MAIN), sourceCode, {
      encoding: "utf8",
    });
    fs.writeFileSync(path.resolve(outDir, "dependencies.json"), JSON.stringify(dependencies, null, "  "), {
      encoding: "utf8",
    });
    console.log("emit ---> " + path.resolve(outDir, MAIN));
  })
  .catch(error => {
    console.log(error);
    console.log(chalk.red(error));
  });
