'use strict'
const { DefaultAzureCredential } = require("@azure/identity")
const { SecretClient } = require("@azure/keyvault-secrets")
const keyVaultName = process.env["KEY_VAULT_NAME"]
const secretName = process.env["FAILURE_INJECTION_PARAM"]
const KVUri = "https://" + keyVaultName + ".vault.azure.net"
const credential = new DefaultAzureCredential()
const client = new SecretClient(KVUri, credential)
const fs = require('fs')
const Mitm = require('mitm')

async function getConfig () {
  try {
    let request = await client.getSecret(secretName)
    return request.value
  } catch (err) {
    console.error(err)
    throw err
  }
}
var injectFailure = function (fn) {
  return async function () {
    try {
      let configResponse = await getConfig()
      let config = JSON.parse(configResponse)
      if (config.isEnabled === true && Math.random() < config.rate) {
        if (config.failureMode === 'latency') {
          let latencyRange = config.maxLatency - config.minLatency
          let setLatency = Math.floor(config.minLatency + Math.random() * latencyRange)
          console.log('Injecting ' + setLatency + ' ms latency.')
          await new Promise(resolve => setTimeout(resolve, setLatency))
        } else if (config.failureMode === 'exception') {
          console.log('Injecting exception message: ' + config.exceptionMsg)
          throw new Error(config.exceptionMsg)
        } else if (config.failureMode === 'statuscode') {
          console.log('Injecting status code: ' + config.statusCode)
          let res = { status: config.statusCode, body: "404 Not Found" }
          return res
        } else if (config.failureMode === 'diskspace') {
          console.log('Injecting disk space: ' + config.diskSpace + ' MB')
          const createFile = (fileName, fileSize) => {
            try {
              const fd = fs.openSync(fileName, 'w')
              fs.writeSync(fd, Buffer.alloc(1), 0, 1, fileSize * 1000 * 1000 - 1)
              fs.closeSync(fd)
            } catch (err) {
              console.error(err)
              throw err
            }
          }
          createFile(process.env.TEMP + '/diskspace-failure-' + Date.now() + '.tmp', config.diskSpace)
        } else if (config.failureMode === 'denylist') {
          console.log('Injecting dependency failure through a network block for denylisted sites: ' + config.denylist)
          let mitm = Mitm()
          let blRegexs = []
          config.denylist.forEach(function (regexStr) {
            blRegexs.push(new RegExp(regexStr))
          })
          mitm.on('connect', function (socket, opts) {
            let block = false
            blRegexs.forEach(function (blRegex) {
              if (blRegex.test(opts.host)) {
                console.log('Intercepted network connection to ' + opts.host)
                block = true
              }
            })
            if (block) {
              socket.end()
            } else {
              socket.bypass()
            }
          })
        }
      }
      return fn.apply(this, arguments)
    } catch (ex) {
      console.log(ex)
      throw ex
    }
  }
}

module.exports = injectFailure
