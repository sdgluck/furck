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
  opts = Object.assign({}, opts, {silent: true})

  if (file.indexOf('.js') !== file.length - 3) {
    file += '.js'
  }

  const child = fork(file, args, opts)

  const promise = new Promise((res, rej) => {
    child
      .on('error', (err) => rej(err))
      .on('exit', (code, signal) => {
        if (code || signal) var basename = path.basename(file)
        if (code) return rej(new Error(`${basename} exited with error code ${code}`))
        if (code === null && signal) return rej(new Error(`${basename} exited because ${signal}`))
        res()
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

  return promise
}
