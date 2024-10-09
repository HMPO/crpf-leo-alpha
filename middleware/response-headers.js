"use strict";
const crypto = require("crypto");

module.exports = (req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");

    res.set("X-Content-Type-Options", "nosniff");
    res.set("X-XSS-Protection", "1; mode=block");
    res.set(
        "Content-Security-Policy",
        `default-src 'self'; script-src 'self' 'nonce-${res.locals.cspNonce}'`,
    );
    next();
};
