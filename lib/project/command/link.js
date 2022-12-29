"use strict"

const { resolve } = require("path");

const {
  readProjectManifest,
  createLocalPackagesList,
  createSortedPackagesList,
  createNpmSymlink,
} = require("../lib/util");

module.exports = localLink;

function localLink(location, root) {
  const manifest = readProjectManifest(location || resolve("."));
  manifest.root = resolve(root);
  const localPackagesList = createLocalPackagesList(manifest);
  const sortedPackagesList = createSortedPackagesList(localPackagesList);
  createNpmSymlink(sortedPackagesList);
}
