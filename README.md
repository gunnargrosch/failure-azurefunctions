# Failure injection for Azure Functions - failure-azurefunctions

## Description

`failure-azurefunctions` is a small Node module for injecting failure into Azure Functions (https://azure.microsoft.com/en-us/services/functions/). It offers a simple failure injection wrapper for your Azure Function handler where you then can choose to inject failure by setting the `failureMode` to `latency`, `exception`, `blacklist`, `diskspace` or `statuscode`. You control your failure injection using Key Vault.

## How to install

1. Install `failure-azurefunctions` module using NPM.
```bash
npm install failure-azurefunctions
```
2. Add the module to your Lambda function code.
```js
const failureAzureFunctions = require('failure-azurefunctions')
```
3. Wrap your handler.
```js
exports.handler = failureAzureFunctions(async (event, context) => {
  ...
})
```
4. Create a secret in Key Vault.
```json
{"isEnabled": false, "failureMode": "latency", "rate": 1, "minLatency": 100, "maxLatency": 400, "exceptionMsg": "Exception message!", "statusCode": 404, "diskSpace": 100, "blacklist": ["*.documents.azure.com"]}
```
5. Add an environment variable to your Azure Function with the key KEY_VAULT_NAME and the value set to the name of your Key Vault and a variable with the key FAILURE_INJECTION_PARAM and the value set to the name of your secret in Key Vault.
6. Try it out!

## Usage

Edit the values of your secret in Key Vault to use the failure injection module.

* `isEnabled: true` means that failure is injected into your Lambda function.
* `isEnabled: false` means that the failure injection module is disabled and no failure is injected.
* `failureMode` selects which failure you want to inject. The options are `latency`, `exception` or `statuscode` as explained below.
* `rate` controls the rate of failure. 1 means that failure is injected on all invocations and 0.5 that failure is injected on about half of all invocations.
* `minLatency` and `maxLatency` is the span of latency in milliseconds injected into your function when `failureMode` is set to `latency`.
* `exceptionMsg` is the message thrown with the exception created when `failureMode` is set to `exception`.
* `statusCode` is the status code returned by your function when `failureMode` is set to `statuscode`.
* `diskSpace` is size in MB of the file created in tmp when `failureMode` is set to `diskspace`.
* `blacklist` is an array of regular expressions, if a connection is made to a host matching one of the regular expressions it will be blocked.

## Notes

Inspired by Yan Cui's articles on latency injection for AWS Lambda (https://hackernoon.com/chaos-engineering-and-aws-lambda-latency-injection-ddeb4ff8d983) and Adrian Hornsby's chaos injection library for Python (https://github.com/adhorn/aws-lambda-chaos-injection/).

## Changelog

### 2020-02-21 v0.0.1

* Initial release

## Contributors

**Gunnar Grosch** - [GitHub](https://github.com/gunnargrosch) | [Twitter](https://twitter.com/gunnargrosch) | [LinkedIn](https://www.linkedin.com/in/gunnargrosch/)

**Jason Barto** - [GitHub](https://github.com/jpbarto) | [Twitter](https://twitter.com/Jason_Barto) | [LinkedIn](https://www.linkedin.com/in/jasonbarto)