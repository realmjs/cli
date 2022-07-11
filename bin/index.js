#!/usr/bin/env node

const zip = require("../lib/zip/zip");
const sync = require("../lib/sync/sync");

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
  case "sync":
    sync(args[1]);
    break;
  default:
    help();
    break;
}

function help() {
  console.log("Syntax: realm <action> [verbose]")
}
