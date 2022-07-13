#!/usr/bin/env node

const zip = require("../lib/zip/zip");
const project = require("../lib/project");

// parsing arguments
const [,, ...args] = process.argv
const path = process.cwd()
const options = {
  verbose: args.indexOf("verbose") === -1 ? false : true
}

// calling subroutines
switch (args[0]) {
  case "zip":
    zip(path, options).then(v => console.log(v)).catch( err => console.log(err));
    break;
  case "project":
    project(args.slice(1));
    break;
  default:
    help();
    break;
}

function help() {
  console.log("Syntax: realm <action> [verbose]")
}
