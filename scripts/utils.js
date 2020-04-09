const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function getTspaths(mode) {
  const pmode = mode === "npm" ? "npm" : "src";
  const { frameworks, packages } = yaml.safeLoad(
    fs.readFileSync(path.resolve(__dirname, "..", "packages.yaml"), { encoding: "utf8" }),
  );
  const pkgs = Object.entries(packages).reduce((p, c) => ({ ...p, [c[0]]: [c[1][pmode]] }), {});
  const fmks = Object.entries(frameworks).reduce((p, c) => ({ ...p, ["@amoebajs/" + c[0]]: [c[1][pmode]] }), {});
  return {
    ...pkgs,
    ...fmks,
  };
}

module.exports.getTspaths = getTspaths;
