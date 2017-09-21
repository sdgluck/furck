<p align="center">
  <img src="https://github.com/sdgluck/furck/blob/master/assets/fork.png" />
</p>

<p><h1 align="center">furck</h1></p>

<p align="center">What the fork?</p>

<p align="center">Made with ❤ at <a href="http://www.twitter.com/outlandish">@outlandish</a></p>
  
<p align="center">
    <a href="http://badge.fury.io/js/furck"><img alt="npm version" src="https://badge.fury.io/js/furck.svg" /></a>
</p>

<hr/>

A simple child_process.fork wrapper...

- promisified child process execution
- better error reporting
- identifies "cannot find module" errors in silent mode
- resolves to last message for "one-off" jobs

## Install

```sh
npm install --save furck
```

```sh
yarn add furck
```

## Import

```js
// ES2015
import fork from 'furck'
```

```sh
// CommonJS
var fork = require('furck')
```

## Usage

### `furck(file, args, opts) : Object`

Fork `file` as a child process. 

- __file__ {String} (required) path to the file to execute
- __args__ {Array} (optional) child_process args array
- __opts__ {Object} (optional) child_process options object

Returns a "fork" (enhanced Promise) that...
- resolves with last message received (if the process exists cleanly)
- rejected when the process errors or exits with code > 0 
<br/>(e.g. uncaught exceptions, unhandled rejections)

### API

- `fork.send(data)` send data to the child process
- `fork.on(event, fn)` hook into an event (e.g. `message`)
- `fork.kill([signal])` kill the process (signal default: `SIGINT`) (returns a Promise)
- `fork.process` underlying child process

#### Example

```js
// master.js
const fork = require('furck')

fork('./worker')
  .on('message', (m) => console.log(m)) //=> squarepants
  .send('spongebob')
  .then(() => console.log('all done'))
  .catch((err) => console.log('uh-oh', err))

// worker.js
process.on('message', (m) => {
  if (m === 'spongebob') {
    process.send('squarepants')
    process.exit(0)
  }
})
```

## Contributing

All pull requests and issues welcome!

If you're not sure how, check out the [great video tutorials on egghead.io](http://bit.ly/2aVzthz)!

## License

MIT © [Sam Gluck](github.com/sdgluck)
