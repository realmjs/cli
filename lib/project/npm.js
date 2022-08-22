"use strict"

const execute = require('./execute');

function install() {
  return execute('npm',  ['install']);
}

function link(modules = []) {
  return execute('npm',  ['link', ...modules])
}

function build() {
  return execute('npm',  ['run', 'build']);
}

module.exports = { link,  install, build };
