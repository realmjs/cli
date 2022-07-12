"use strict"

const process = require("process");

function project(args) {
  console.log (args)
  console.log(process.cwd())
}

module.exports = project;
