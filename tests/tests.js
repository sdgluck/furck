const fork = require('../')

describe('furck', () => {
  it('throws with bad args', () => {
    expect(() => fork()).toThrowError(/expecting file/)
    expect(() => fork('.', 1)).toThrowError(/expecting args/)
    expect(() => fork('.', [], 1)).toThrowError(/expecting opts/)
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

  it('gets messages', (done) => {
    const child = fork('./tests/good-worker')

    child.on('message', (message) => {
      if (message === 'squarepants') {
        done()
      }
    })

    child.send('spongebob')
  })
})
