"use strict"

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')

function zip(location, options) {
  return new Promise((resolve, reject) => {

    const root = location || __dirname

    // create folder deploy
    const deployDir = `${root}/deploy`
    if (!fs.existsSync(deployDir)) { fs.mkdirSync(deployDir) }
    const zippath = `${deployDir}/${path.basename(root)}.zip`

    // create a file to stream archive data to deploy
    const output = fs.createWriteStream(zippath)
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes')
      resolve('archiver has been finalized and the output file descriptor has closed.')
    })
    output.on('end', function() {
      reject('Data has been drained');
    })

    // create archive
    const donelist = []
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    })
    archive.on('entry', function (entry) {
      if (options && options.verbose === true) {
        if (entry.type === 'directory') { return }
        const name = path.basename(entry.name)
        const upperPath = entry.name.replace(`/${name}`,'')
        if (whitelist.indexOf(entry.name.replace(/(^\/|$\/)/,'')) !== -1) {
          console.log(`...archiving ${entry.type} ${entry.name}`)
          donelist.push(entry.name)
          return
        }
        if (donelist.indexOf(upperPath) === -1) {
          console.log(`...archiving directory ${upperPath}`)
          donelist.push(upperPath)
          return
        }
       }
    })
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        console.log('Warning: ENOENT')
        console.log(err)
      } else {
        // throw error
        reject(err)
      }
    })
    archive.on('error', function(err) {
      reject(err)
    })

    // pipe archive data to the file
    archive.pipe(output)

    // read .zipignore to create backlist
    const zipignore = fs.readFileSync(path.join(root, '.zipignore'), {encoding: 'utf-8'})
    const blacklist = zipignore.split('\n')
                               .map( item => item.trim().replace(/\/$/, '') )
                               .filter( item => item.length > 0 && !/^#/.test(item))
    // create white list that will be zipped
    // white list the all folders and files under root dir except what listed in blacklist, deploy, and .zipignore
    const whitelist = fs.readdirSync(root).filter( item => !/(^\.zipignore$|^deploy$)/.test(item) && blacklist.indexOf(item) === -1)

    // start archiving
    console.log(`\nPreparing to archive ${root}`)
    whitelist.forEach( item => {
      console.log(`...adding ${item} to achive`)
      if (fs.lstatSync(`${root}/${item}`).isDirectory()) {
        archive.directory(`${root}/${item}`, item)
      } else {
        archive.file(`${root}/${item}`, {name: item})
      }
    })
    console.log('\nArchiving...')
    archive.finalize()

  })
}

module.exports = zip
