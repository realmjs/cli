"use strict"

const { execSync } = require('child_process');

function execute(cmd, args) {
  try {
    const command = `${cmd} ${args.join(" ")}`;
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    console.error(err.stderr);
  }
}

module.exports = execute;
