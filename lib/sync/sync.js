"use strict"

const process = require("process");
const fs = require("fs");
const { resolve } = require("path");
const git = require("./git");

(async function () {

  const location = "./devtest"; // hardcode during dev, will be replaced soon

  const manifest = readProjectManifest(location);

  //todo: validateManifest(manifest);

  prepareDirectory(manifest.directory, resolve(manifest.root));

  forEachPackage(manifest, updateRepo);

  forEachPackage(manifest, installPackage);

  const localPackagesList = createLocalPackagesList(manifest);
  createNpmSymlinkForLocalPackages(localPackagesList);

})();

function readProjectManifest(location) {
  if (!fs.existsSync(`${location}/manifest.json`)) {
    throw new Error(`${location}/manifest.json does not exist`);
  }
  return JSON.parse( fs.readFileSync(`${location}/manifest.json`) );
}

function prepareDirectory(directory, root) {
  const { path, folders } = directory;
  if (!fs.existsSync(`${root}/${path}`)) {
    fs.mkdirSync(`${root}/${path}`, { recursive: true });
    console.log(`created directory ${root}/${path}`);
  }
  folders.forEach(entry => entry["directory"] && prepareDirectory(entry["directory"], `${root}/${path}`) );
}

function updateRepo(subfolder, path) {
  const { name, url } = subfolder;
  if (fs.existsSync(name)) {
    console.log(`fetch ${name} and pull to latest`);
    process.chdir(name);
    // await git.fetch();
    // await git.pull();
    process.chdir("../");
  } else {
    console.log(`clone ${name} from ${url} to ${path}`);
    // await git.clone(url, name);
  }
}

function installPackage(subfolder) {
  const { name } = subfolder;
  console.log(`install package ${name}`)
}

function forEachPackage(manifest, callback) {

  const cwd = process.cwd();
  const directory = manifest.directory;
  const root = resolve(manifest.root);
  process.chdir(root);
  _forEach(directory, root);
  process.chdir(cwd);

  function _forEach(directory, root) {
    const { path, folders } = directory;
    process.chdir(`${root}/${path}`);
    folders.forEach(entry => {
      if (entry["package"]) {
        callback && callback(entry["package"], `${root}/${path}`);
      } else if (entry["directory"]) {
        _forEach(entry["directory"], `${root}/${path}`);
      }
    });
  }

}

function createLocalPackagesList(manifest) {
  const localPackagesList = {};
  forEachPackage(manifest, (subfolder, path) => {
    const { name } = subfolder;
    const packageDescription = JSON.parse( fs.readFileSync(`${path}/${name}/package.json`) );
    localPackagesList[packageDescription.name] = `${path}/${name}`;
  });
  return localPackagesList;
}

function createNpmSymlinkForLocalPackages(localPackagesList) {
  const cwd = process.cwd();

  const linkedSymbol = {};
  for (let name in localPackagesList) {
    process.chdir(localPackagesList[name]);
    if (fs.existsSync("dependencies.local")) {
      const dependencies = readDependency("dependencies.local");
      _createSymlink(name, dependencies);
    }
  }

  process.chdir(cwd);

  function _createSymlink(packageName, dependencies) {
    const cwd = process.cwd();
    dependencies.forEach(name => {
      process.chdir(localPackagesList[name]);
      if (fs.existsSync("dependencies.local")) {
        const dependencies = readDependency("dependencies.local");
        _createSymlink(name, dependencies);
      }
      if (linkedSymbol[name] === undefined) {
        linkedSymbol[name] = true;
        console.log(`${localPackagesList[name]}: npm link`)
      }
    });
    process.chdir(cwd);
    if (linkedSymbol[packageName] === undefined) {
      console.log(`${process.cwd()}: npm link ${dependencies.join(" ")}`);
    }
  }
}

function readDependency(filename) {
  const str = fs.readFileSync(filename, "utf-8");
  const dependencies = str.split("\n")
                          .map(line => line.trim())
                          .filter(line => /^\s*#/.test(line) !== true && line.length > 0)
                          .map(line => line.replace(/#.*$/,"").trim());
  return dependencies;
}
