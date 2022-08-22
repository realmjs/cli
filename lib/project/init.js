"use strict"

const process = require("process");
const fs = require("fs");
const { resolve } = require("path");
const git = require("./git");
const npm = require("./npm");

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

function readProjectManifest(location) {
  if (!fs.existsSync(`${location}/manifest.json`)) {
    throw new Error(`${location}/manifest.json does not exist`);
  }
  return JSON.parse( fs.readFileSync(`${location}/manifest.json`) );
}

function prepareDirectory(directory, root) {
  const { path, folders } = directory;
  const location = resolve(root, path);
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true });
    console.log(`created directory ${location}`);
  }
  folders.forEach(entry => entry.type === "directory" && prepareDirectory(entry["directory"], `${root}/${path}`) );
}

function updateRepo(subfolder, path) {
  const cwd = process.cwd();
  const { name, url } = subfolder;
  if (fs.existsSync(`${path}/${name}`)) {
    console.log(`fetch ${name} in ${path} and pull to latest`);
    process.chdir(`${path}/${name}`);
     git.fetch();
     git.pull();
  } else {
    console.log(`clone ${name} from ${url} to ${path}`);
    process.chdir(path);
     git.clone(url, name);
  }
  process.chdir(cwd);
}

function installPackage(subfolder, path) {
  const cwd = process.cwd();
  const { name } = subfolder;
  console.log(`install package ${name} at ${path}`);
  process.chdir(`${path}/${name}`);
  npm.install();
  process.chdir(cwd);
}

function forEachPackage(manifest, callback) {
  const directory = manifest.directory;
  const root = resolve(manifest.root);
  _forEach(directory, root);

  function _forEach(directory, root) {
    const { path, folders } = directory;
    folders.forEach( entry => {
      if (entry.type === "package") {
        callback &&  callback(entry, resolve(root, path));
      } else if (entry.type === "directory") {
         _forEach(entry["directory"], resolve(root, path));
      }
    });
  }

}

function createLocalPackagesList(manifest) {
  const localPackagesList = {};
   forEachPackage(manifest, (subfolder, path) => {
    const { name } = subfolder;
    const packageDescription = JSON.parse( fs.readFileSync(`${path}/${name}/package.json`) );
    localPackagesList[packageDescription.name] = resolve(path,name);
  });
  return localPackagesList;
}

function createSortedPackagesList(localPackagesList) {
  const cwd = process.cwd();
  const sorted = [];
  for (let name in localPackagesList) {
    process.chdir(localPackagesList[name]);
    if (fs.existsSync("dependencies.local")) {
      const dependencies = readDependency("dependencies.local");
      _sort(name, dependencies);
    }
    (!sorted.find(pack => pack.name === name)) && sorted.push({ name, path: localPackagesList[name], localLink: false });
  }
  process.chdir(cwd);
  return sorted;

  function _sort(packageName, dependencies) {
    const cwd = process.cwd();
    dependencies.forEach(name => {
      process.chdir(localPackagesList[name]);
      if (fs.existsSync("dependencies.local")) {
        const dependencies = readDependency("dependencies.local");
        _sort(name, dependencies);
      }
      (!sorted.find(pack => pack.name === name)) && sorted.push({ name, path: localPackagesList[name], localLink: true });
    });
    process.chdir(cwd);
    (!sorted.find(pack => pack.name === packageName)) && sorted.push({ name: packageName, path: localPackagesList[packageName], localLink: true });
  }
}

function createNpmSymlink(sortedPackagesList) {
  const cwd = process.cwd();
  sortedPackagesList.forEach(pack => {
    process.chdir(pack.path);
    if (pack.localLink === true) {
      console.log(`${process.cwd()}: npm link`);
      npm.link();
    }
    if (fs.existsSync("dependencies.local")) {
      const dependencies = readDependency("dependencies.local");
      console.log(`${process.cwd()}: npm link ${dependencies.join(" ")}`);
      npm.link(dependencies);
    }
  });
  process.chdir(cwd);
}

function readDependency(filename) {
  const str = fs.readFileSync(filename, "utf-8");
  const dependencies = str.split("\n")
                          .map(line => line.trim())
                          .filter(line => /^\s*#/.test(line) !== true && line.length > 0)
                          .map(line => line.replace(/#.*$/,"").trim());
  return dependencies;
}

function buildLocalPackages(sortedPackagesList) {
  const cwd = process.cwd();
  sortedPackagesList.forEach(pack => {
    process.chdir(pack.path);
    const packageDescription = JSON.parse( fs.readFileSync("package.json") );
    packageDescription.scripts && packageDescription.scripts.build && npm.build();
  });
  process.chdir(cwd);
}
