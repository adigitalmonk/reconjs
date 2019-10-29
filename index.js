const EventEmitter = require('events');
const http = require('http');

const eventCodes = {
    configLoaded: "recon-config-loaded",
    readError: "recon-read-error",
    configError: "recon-config-error",
    connectionError: "recon-conn-fail",
    keySkipped: "recon-key-skipped"
};

const getConfig = (config, Events) => {
    const host = config.RECON_HOST || process.env.RECON_HOST || "localhost";
    const port = config.RECON_PORT || process.env.RECON_PORT || 80;
    const api = config.RECON_API || process.env.RECON_API || "/api/config";
    const options = { 
        header: {
            'Authorization': config.RECON_AUTH_TOKEN || process.env.RECON_AUTH_TOKEN || ""
        }
    };

    return new Promise((resolve, _reject) => {
        const requestPath = ['http://', host, ':', port, api].join("");
        http.get(requestPath, options, (res) => {
            const { statusCode } = res;
            if (statusCode !== 200) {
                Events.emit(eventCodes.connectionError, statusCode);
                res.resume();
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';

            res.on('data', (chunk) => { 
                rawData += chunk; 
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                } catch (errData) {
                    Events.emit(eventCodes.readError, errData)
                }
            });
        }).on('error', (errData) => {
            Events.emit(eventCodes.configError, errData)
        });
    });
};

module.exports = (config = {}) => {
    const Events = new EventEmitter();

    getConfig(config, Events).then((data) => {
        const configKeys = [];
        const skipExisting = config.SKIP_EXISTING || false;
        Object.entries(data).forEach(([key, value]) => {
            let realKey = key.toUpperCase();
            if (skipExisting && process.env[realKey]) {
                Events.emit(keySkipped, [ realKey, value ]);
                return;
            }
            configKeys.push([realKey, !process.env[realKey]]);
            process.env[realKey] = value;
        });
        Events.emit(eventCodes.configLoaded, configKeys);
    }).catch((errData) => {
        Events.emit(eventCodes.configError, errData);
    });

    return Events;
};
