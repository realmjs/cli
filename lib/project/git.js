"use strict"

const execute = require('./execute');

function clone(url, directory) {
  return execute('git', ["clone", url, directory]);
}

function fetch() {
  return execute('git', ["fetch"]);
}

function pull() {
  return execute('git', ["pull"]);
}


module.exports = { clone, fetch, pull };
