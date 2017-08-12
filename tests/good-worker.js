process.on('message', (message) => {
  if (message === 'spongebob') {
    process.send('squarepants')
    process.exit(0)
  }
})
