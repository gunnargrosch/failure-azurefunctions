# Failure injection for Azure Functions - failure-azurefunctions

## Description

`failure-azurefunctions` is a small Node module for injecting failure into Azure Functions (https://azure.microsoft.com/en-us/services/functions/). It offers a simple failure injection wrapper for your Azure Function handler where you then can choose to inject failure by setting the `failureMode` to `latency`, `exception`, `blacklist`, `diskspace` or `statuscode`. You control your failure injection using Key Vault.

## How to install

1. Install `failure-azurefunctions` module using NPM.
```bash
npm install failure-azurefunctions
```
2. Add the module to your Azure function code.
```js
const failureAzureFunctions = require('failure-azurefunctions')
```
3. Wrap your handler.
```js
exports.handler = failureAzureFunctions(async (event, context) => {
  ...
})
```
4. Create a resource group and key vault (or skip to use existing one).
```bash
az group create --name <resource-group-name> -l "EastUS"
az keyvault create --name <your-unique-keyvault-name> -g <resource-group-name>
```
5. Create a service principal.
```bash
az ad sp create-for-rbac --sdk-auth
```
6. Give the service principal access to your key vault
```bash
az keyvault set-policy -n <your-unique-keyvault-name> --spn <clientId-of-your-service-principal> --secret-permissions delete get list set --key-permissions decrypt encrypt get list unwrapKey wrapKey
```
7. Create a secret in Key Vault.
```json
{"isEnabled": false, "failureMode": "latency", "rate": 1, "minLatency": 100, "maxLatency": 400, "exceptionMsg": "Exception message!", "statusCode": 404, "diskSpace": 100, "blacklist": ["*.documents.azure.com"]}
```
```bash
az keyvault secret set --name <your-secret-name> --vault-name <your-unique-keyvault-name> --value "{\`"isEnabled\`": false, \`"failureMode\`": \`"latency\`", \`"rate\`": 1, \`"minLatency\`": 100, \`"maxLatency\`": 400, \`"exceptionMsg\`": \`"Exception message!\`", \`"statusCode\`": 404, \`"diskSpace\`": 100, \`"blacklist\`": [\`"s3.*.amazonaws.com\`", \`"dynamodb.*.amazonaws.com\`"]}"
```
8. Add environment variables to your Azure Function with values from above.
```bash
AZURE_CLIENT_ID=<your-clientID>
AZURE_CLIENT_SECRET=<your-clientSecret>
AZURE_TENANT_ID=<your-tenantId>
KEY_VAULT_NAME=<your-unique-keyvault-name>
FAILURE_INJECTION_PARAM=<your-secret-name>
```
```bash
az functionapp config appsettings set --name <function-app-name> \
--resource-group <resource-group-name> --settings AZURE_CLIENT_ID=<your-clientID> AZURE_CLIENT_SECRET=<your-clientSecret> AZURE_TENANT_ID=<your-tenantId> KEY_VAULT_NAME=<your-unique-keyvault-name> FAILURE_INJECTION_PARAM=<your-secret-name>
```
9. Try it out!

## Usage

Edit the values of your secret in Key Vault to use the failure injection module.

* `isEnabled: true` means that failure is injected into your Azure function.
* `isEnabled: false` means that the failure injection module is disabled and no failure is injected.
* `failureMode` selects which failure you want to inject. The options are `latency`, `exception` or `statuscode` as explained below.
* `rate` controls the rate of failure. 1 means that failure is injected on all invocations and 0.5 that failure is injected on about half of all invocations.
* `minLatency` and `maxLatency` is the span of latency in milliseconds injected into your function when `failureMode` is set to `latency`.
* `exceptionMsg` is the message thrown with the exception created when `failureMode` is set to `exception`.
* `statusCode` is the status code returned by your function when `failureMode` is set to `statuscode`.
* `diskSpace` is size in MB of the file created in tmp when `failureMode` is set to `diskspace`.
* `blacklist` is an array of regular expressions, if a connection is made to a host matching one of the regular expressions it will be blocked.

## Example

In the subfolder `example` is a simple function which can be installed in Azure and used for test.

## Notes

Inspired by Yan Cui's articles on latency injection for AWS Lambda (https://hackernoon.com/chaos-engineering-and-aws-lambda-latency-injection-ddeb4ff8d983) and Adrian Hornsby's chaos injection library for Python (https://github.com/adhorn/aws-lambda-chaos-injection/).

## Changelog

### 2020-02-28 v0.2.0

* Fixed Key Vault integration.
* Added simple example.
* Updated documentation.

### 2020-02-21 v0.0.1

* Initial release

## Contributors

**Gunnar Grosch** - [GitHub](https://github.com/gunnargrosch) | [Twitter](https://twitter.com/gunnargrosch) | [LinkedIn](https://www.linkedin.com/in/gunnargrosch/)

**Jason Barto** - [GitHub](https://github.com/jpbarto) | [Twitter](https://twitter.com/Jason_Barto) | [LinkedIn](https://www.linkedin.com/in/jasonbarto)