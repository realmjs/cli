"use strict"

const init = require("./command/init");
const localLink = require("./command/link");

function project(args) {
  const [action, ...options] = args
  const location = options[0];
  switch (action) {
    case "init":
      init(location);
      break;
    case "link":
      localLink(location);
    default:
      console.log("Usage: realm project init [location] [--verbose|-v]");
  }
}

module.exports = project;
