const { config } = require("hmpo-app");
const jwt = require("jsonwebtoken");
const uuidv4 = require("uuid").v4;
const fs = require("fs");
const moment = require("moment");

const ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const GRANT_TYPE = "authorization_code";

const getSignedJwtAssertion = () => {
    const jwtData = {
        aud: `${config.get("one-login.url")}/token`,
        iss: config.get("one-login.client_id"),
        sub: config.get("one-login.client_id"),
        exp: moment().add(5, "minutes").unix(),
        jti: uuidv4(),
        iat: moment().unix(),
    };
    let options = {
        algorithm: "RS256",
    };
    return jwt.sign(
        jwtData,
        fs.readFileSync(config.get("one-login.private-key")),
        options,
    );
};

module.exports = { getSignedJwtAssertion, ASSERTION_TYPE, GRANT_TYPE };
