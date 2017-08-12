Promise.resolve().then(() => {
  return Promise.reject(new Error('unhandled rejection'))
})
