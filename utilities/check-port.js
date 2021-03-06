"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const SilentError = require('silent-error');
const PortFinder = require('portfinder');
const getPort = util_1.promisify(PortFinder.getPort);
function checkPort(port, host, basePort = 49152) {
    PortFinder.basePort = basePort;
    return getPort({ port, host })
        .then(foundPort => {
        // If the port isn't available and we weren't looking for any port, throw error.
        if (port !== foundPort && port !== 0) {
            throw new SilentError(`Port ${port} is already in use. Use '--port' to specify a different port.`);
        }
        // Otherwise, our found port is good.
        return foundPort;
    });
}
exports.checkPort = checkPort;
//# sourceMappingURL=/users/jskrzypek/dev/angular/angular-cli/utilities/check-port.js.map