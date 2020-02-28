const failureAzureFunctions = require('failure-azurefunctions')
const fs = require('fs')
let res

module.exports = failureAzureFunctions(async function(context, req) {
  try {
    fs.writeFile(process.env.TEMP + '/example-' + Date.now() + '.tmp', 'Contents', (err) => {
      if (err) throw err
    })
    res = {
      status: 200,
      body: 'Hello failureAzureFunction!'
    }
  } catch (err) {
    res = {
      status: 400
    }
  }
  return res
})
