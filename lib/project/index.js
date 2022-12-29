"use strict"

const init = require("./command/init");
const localLink = require("./command/link");

function project(args) {
  const [action, ...options] = args
  const location = options[0];
  const root = options[1];
  switch (action) {
    case "init":
      init(location, root);
      break;
    case "link":
      localLink(location, root);
    default:
      console.log("Usage: realm project init [location] [root] [--verbose|-v]");
  }
}

module.exports = project;
