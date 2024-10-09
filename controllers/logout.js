const BaseController = require("hmpo-form-wizard").Controller;
const { featureFlag } = require("hmpo-app");
const _ = require("underscore");
const logout = require("../lib/logout");

class LogoutController extends BaseController {
    successHandler(req, res) {
        if (
            req.session["isAuthenticated"] === true &&
            featureFlag.isEnabled("oneLogin", req)
        ) {
            const logoutUrl = _.template(logout.getLogoutUrl())({
                idToken: logout.getIdToken(req),
                logoutRedirectUri: logout.getRedirectUri(),
                state: logout.getState(),
            });
            req.session.destroy();
            res.redirect(logoutUrl);
        } else {
            req.session.destroy();
            res.redirect(logout.getRedirectUri());
        }
    }
}

module.exports = LogoutController;
