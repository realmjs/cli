"use strict"

const { spawn } = require("child_process");

function clone(url, directory) {
  return new Promise((resolve, reject) => {

    const proc = spawn("git", ["clone", url, directory]);

    proc.on("close", code => (code === 0) ? resolve(code) : reject(code) );

    proc.stdout.on("data", (data) => console.log(`${data}`));
    proc.stderr.on("data", (data) => console.error(`${data}`));

  });
}

function fetch(path) {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    process.chdir(path);

    const proc = spawn("git", ["fetch"]);
    process.chdir(cwd);

    proc.on("close", code => (code === 0) ? resolve(code) : reject(code) );

    proc.stdout.on("data", (data) => console.log(`${data}`));
    proc.stderr.on("data", (data) => console.log(`${data}`));
  })
}

function pull(path) {
  return new Promise((resolve, reject) => {
    const cwd = process.cwd();
    process.chdir(path);

    const proc = spawn("git", ["pull"]);
    process.chdir(cwd);

    proc.on("close", code => (code === 0) ? resolve(code) : reject(code) );

    proc.stdout.on("data", (data) => console.log(`${data}`));
    proc.stderr.on("data", (data) => console.log(`${data}`));
  })
}


module.exports = { clone, fetch, pull };
