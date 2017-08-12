# furck

> :fork_and_knife: what the fork?

a simple child_process.fork wrapper

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

Returns a Promise that...
- resolves when the process exists cleanly
- rejected when the process errors or exits with code > 0

## Example

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
````

## Contributing

All pull requests and issues welcome!

If you're not sure how, check out the [great video tutorials on egghead.io](http://bit.ly/2aVzthz)!

## License

MIT © [Sam Gluck](github.com/sdgluck)
