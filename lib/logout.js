const { config } = require("hmpo-app");
const uuidv4 = require("uuid").v4;

const getIdToken = (req) => {
    return req.sessionModel.get("id-token") || "";
};

const getLogoutUrl = () => {
    return config.get("one-login.url") + config.get("one-login.logout");
};

const getState = () => {
    return uuidv4();
};

const getRedirectUri = () => {
    return config.get("one-login.logout_redirect_uri");
};

module.exports = {
    getLogoutUrl,
    getIdToken,
    getState,
    getRedirectUri,
};
