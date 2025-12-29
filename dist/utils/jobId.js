"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeJobId = makeJobId;
const crypto_1 = require("crypto");
function makeJobId(parts) {
    const str = Object.keys(parts)
        .sort()
        .map(k => `${k}=${String(parts[k])}`)
        .join('|');
    return (0, crypto_1.createHash)('sha256').update(str).digest('hex');
}
exports.default = makeJobId;
