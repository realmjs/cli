"use strict"

const init = require("./init");

function project(args) {
  const [action, ...options] = args
  const location = options[0];
  switch (action) {
    case "init":
      init(location);
      break;
    default:
      console.log("Usage: realm project init [location] [--verbose|-v]");
  }
}

module.exports = project;
