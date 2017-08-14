const fork = require('../index')

describe('furck', () => {
  it('throws with bad args', () => {
    expect(() => fork()).toThrowError(/expecting file/)
    expect(() => fork('.', 1)).toThrowError(/expecting args/)
    expect(() => fork('.', [], 1)).toThrowError(/expecting opts/)
  })

  it('catches cannot find module', () => {
    return fork('./spongebob.js').catch((err) => {
      expect(err.message).toContain('Cannot find module')
    })
  })

  it('catches uncaught exception', () => {
    return fork('./tests/uncaught-exception').catch((err) => {
      expect(err.message).toContain('uncaught-exception.js exited')
    })
  })

  it('catches unhandled rejection', () => {
    return fork('./tests/unhandled-rejection').catch((err) => {
      expect(err.message).toContain('unhandled-rejection.js exited')
    })
  })

  it('catches bad exit', () => {
    return fork('./tests/bad-worker').catch((err) => {
      expect(err.message).toContain('bad-worker.js exited')
    })
  })

  it('directory refs are honoured in error', () => {
    return fork('./tests/worker/').catch((err) => {
      expect(err.message).toContain('worker/index.js exited')
    })
  })

  it('kills process', () => {
    const child = fork('./tests/hello')
    let gotMessage = false

    child.on('message', (message) => {
      gotMessage = message
    })

    child.kill() // 'SIGINT'

    return child
      .then(() => expect(gotMessage).toBe('hello'))
      .catch((err) => expect(err.message).toContain('exited with error code 1'))
  })

  it('gets messages', () => {
    return fork('./tests/good-worker')
      .on('message', (message) => {
        expect(message).toBe('squarepants')
      })
      .send('spongebob')
  })

  it('resolves to last message', () => {
    return fork('./tests/good-worker')
      .send('spongebob')
      .then((message) => {
        expect(message).toBe('squarepants')
      })
      .catch((err) => {
      console.log(err)
      })
  })
})
