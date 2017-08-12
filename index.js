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

  if (file.indexOf('.js') !== file.length - 3) {
    file += '.js'
  }

  const child = fork(file, args, opts)

  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res
    reject = rej

    child.on('error', reject)

    child.on('exit', (code, signal) => {
      if (code || signal) {
        const basename = path.basename(file)

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
