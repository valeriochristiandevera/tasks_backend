const util = require("node:util");

// NeDB (1.8.x) still expects legacy util helpers removed in newer Node versions.
if (typeof util.isDate !== "function") {
  util.isDate = (value) => value instanceof Date;
}

if (typeof util.isRegExp !== "function") {
  util.isRegExp = (value) => value instanceof RegExp;
}

const Datastore = require("nedb");
const path = require("path");

const tasks = new Datastore({
  filename: path.join(__dirname, "data", "tasks.db"),
  autoload: true,
  timestampData: true,
});

module.exports = { tasks };
