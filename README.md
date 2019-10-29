# ReconJS

A simple tool for pulling your configuration from a remote machine.

## Configuration

There are four configuration options, these can be passed in either via an object `{}` or environment variables.

| Option | Purpose | Default |
| :----: | :-----: | :------ |
| RECON_HOST | The remote host to pull the config from. | localhost |
| RECON_PORT | The port to | 80 |
| RECON_API | The API resource on the remote host  | `/api/config` |
| RECON_AUTH_TOKEN | A token to add the authorization header. | "" |
| SKIP_EXISTING | Whether or not to skip existing variables if they already exist in the environment. | `false` |

## Usage

```javascript
const configEvents = require('reconjs')({
    RECON_HOST: "localhost",
    RECON_PORT: 4000,
    RECON_API: "/v1/api/config",
    RECON_AUTH_TOKEN: "MY_AWESOME_SECURITY_KEY",
    SKIP_EXISTING: true
});
```

The configuration returns an event emitter that you can use to handle what happens after the configuration finishes loading.

```javascript
configEvents.on('recon-config-loaded', (newKeys) => {
    console.table(newKeys);
});
```

Once the config is loaded, the variables are added to `process.env` (lowercase keys are made uppercase).

## Events

| Event | Data | Purpose |
| :---: | :---: | :-----: |
| `recon-config-loaded` | [ [ 'newKey' , true ], [ 'oldKey', false ] ] | The new keys that were added in a two dimensional array.  The inner tuple repesents the new key and whether or not it overrides an existing one. |
| `recon-config-error` | `Exception` | Exception raised on an error from the `http` request | 
| `recon-read-error` | `Exception` | When reading the JSON config response, an exception happened. |
| `recon-conn-fail` | `401` | We were unable to connect to the remote server.  The event payload is the HTTP status code. |
| `recon-key-skipped` | ['existingKey', 'someValue'] | A key was skipped because it already exists. |

## TODO

- Tests
- HTTPS support
