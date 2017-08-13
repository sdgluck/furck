const fork = require('child_process').fork
const path = require('path')
const fs = require('fs')

module.exports = function furck (file, args, opts) {
  if (typeof file !== 'string' || !file.length) {
    throw new Error('expecting file to be non-empty string')
  } else if (args && !Array.isArray(args)) {
    throw new Error('expecting args to be array')
  } else if (opts && typeof opts !== 'object') {
    throw new Error('expecting opts to be object')
  }

  file = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file)
  args = args || []
  opts = Object.assign({silent: true}, opts)

  let basename = path.basename(file)

  // fiddle with the file path so logs are more clear
  if (file.indexOf('.js') !== file.length - 3) {
    if (fs.existsSync(file + '.js')) {
      file += '.js'
      basename = path.basename(file)
    } else {
      const split = file.split(path.sep)
      basename = split[split.length - 1].replace(/\\$/) + '/index.js'
    }
  }

  const child = fork(file, args, opts)

  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res
    reject = rej

    child.on('error', reject)

    child.on('exit', (code, signal) => {
      if (code || signal) {
        if (code) {
          reject(new Error(`${basename} exited with error code ${code}`))
          return
        }

        if (code === null && signal) {
          reject(new Error(`${basename} exited because ${signal}`))
          return
        }
      }

      resolve()
    })
  })

  promise.process = child

  promise.kill = () => {
    if (opts.silent) {
      child.stdout.pause()
      child.stderr.pause()
    }
    process.kill(child.pid)
  }

  promise.on = function () {
    child.on.apply(child, arguments)
    return promise
  }

  promise.send = (message) => {
    child.send(message)
    return promise
  }

  if (opts.silent) {
    child.stdout.on('stdout', (data) => {
      child.emit('stdout', data)
    })

    child.stderr.on('data', (data) => {
      if (String(data).indexOf(`Cannot find module '${file}'`) > -1) {
        reject(new Error(`Cannot find module '${file}'`))
      }
      child.emit('stderr', data)
    })
  }

  return promise
}
