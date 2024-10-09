const { config } = require("hmpo-app");
const jwt = require("jsonwebtoken");
const uuidv4 = require("uuid").v4;
const fs = require("fs");

const RESPONSE_TYPE = "code";
const SCOPE = "openid email phone";
const VTR = "[Cl.Cm]";

const getAuthorizeRequestObject = () => {
    const payload = {
        aud: `${config.get("one-login.url")}/authorize`,
        iss: config.get("one-login.client_id"),
        response_type: RESPONSE_TYPE,
        client_id: config.get("one-login.client_id"),
        redirect_uri: config.get("one-login.redirect_uri"),
        scope: SCOPE,
        state: uuidv4(),
        nonce: uuidv4(),
        vtr: VTR,
    };
    let options = {
        algorithm: "RS256",
        expiresIn: "5 minutes",
    };
    const authorizeRequestObject = jwt.sign(
        payload,
        fs.readFileSync(config.get("one-login.private-key")),
        options,
    );
    return authorizeRequestObject;
};

const getAuthorizeUrl = () => {
    return config.get("one-login.url") + config.get("one-login.authorize");
};

const getClientId = () => {
    return config.get("one-login.client_id");
};

module.exports = {
    getAuthorizeRequestObject,
    getAuthorizeUrl,
    getClientId,
    RESPONSE_TYPE,
    SCOPE,
};
