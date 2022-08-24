"use strict"

const {
  readProjectManifest,
  createLocalPackagesList,
  createSortedPackagesList,
  createNpmSymlink,
} = require("../lib/util");

module.exports = localLink;

function localLink(location) {
  const manifest = readProjectManifest(location || resolve("."));
  const localPackagesList = createLocalPackagesList(manifest);
  const sortedPackagesList = createSortedPackagesList(localPackagesList);
  createNpmSymlink(sortedPackagesList);
}
