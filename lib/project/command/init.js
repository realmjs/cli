"use strict"

const fs = require("fs");
const { resolve } = require("path");
const {
  readProjectManifest,
  updateRepo,
  installPackage,
  createLocalPackagesList,
  createSortedPackagesList,
  createNpmSymlink,
  buildLocalPackages,
  forEachPackage,
} = require("../lib/util");

module.exports = sync;
function sync (location) {

  const manifest = readProjectManifest(location || resolve("."));

  //todo: validateManifest(manifest);

  prepareDirectory(manifest.directory, resolve(manifest.root));

  forEachPackage(manifest, updateRepo);

  forEachPackage(manifest, installPackage);

  const localPackagesList = createLocalPackagesList(manifest);
  const sortedPackagesList = createSortedPackagesList(localPackagesList);

  createNpmSymlink(sortedPackagesList);

  buildLocalPackages(sortedPackagesList);

};


function prepareDirectory(directory, root) {
  const { path, folders } = directory;
  const location = resolve(root, path);
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
    console.log(`created directory ${location}`);
  }
  folders.forEach(entry => entry.type === "directory" && prepareDirectory(entry["directory"], `${root}/${path}`) );
}
