const { register } = require("tsconfig-paths");
const { getTspaths } = require("./utils");

register({
  baseUrl: ".",
  paths: getTspaths("npm"),
});
