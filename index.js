const {fork} = require('child_process')
const assert = require('argsy')
const path = require('path')
const fs = require('fs')

module.exports = function furck (file, args = [], opts = {}) {
  assert('furck')
    .nonEmptyStr(file, 'file')
    .arr(args, 'args')
    .obj(opts, 'opts')
    .$eval()

  file = path.resolve(process.cwd(), file)
  opts = Object.assign({silent: true}, opts)
  args = args || []

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

  let lastMessage = null

  let resolve, reject, promise = new Promise((res, rej) => {
    resolve = res
    reject = rej

    child
      .on('message', (msg) => lastMessage = msg)
      .on('error', reject)
      .on('exit', onExit)

    function onExit (code, signal) {
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

      resolve(lastMessage)
    }
  })

  promise.process = child

  promise.kill = (signal = 'SIGINT') => {
    if (opts.silent) {
      child.stdout.pause()
      child.stderr.pause()
    }
    process.kill(child.pid, signal)
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
