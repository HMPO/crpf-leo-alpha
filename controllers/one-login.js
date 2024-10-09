const BaseController = require("hmpo-form-wizard").Controller;
const { featureFlag } = require("hmpo-app");
const _ = require("underscore");
const oneLoginAuthorize = require("../lib/one-login-authorize");

class OneLoginController extends BaseController {
    successHandler(req, res, next) {
        if (req.sessionModel.get("searching-for-one-person") === "yes") {
            if (featureFlag.isEnabled("oneLogin", req)) {
                // This journey step needs to be explicitly set to complete since the base successHandler function is being overridden.
                this.setStepComplete(req, res);

                req.session["isAuthenticated"] = false;
                const oneLoginAuthorizeUrl = _.template(
                    oneLoginAuthorize.getAuthorizeUrl(),
                )({
                    responseType: oneLoginAuthorize.RESPONSE_TYPE,
                    scope: oneLoginAuthorize.SCOPE,
                    clientId: oneLoginAuthorize.getClientId(),
                    requestParam: oneLoginAuthorize.getAuthorizeRequestObject(),
                });
                res.redirect(oneLoginAuthorizeUrl);
            } else {
                req.session["isAuthenticated"] = true;

                super.successHandler(req, res, next);
            }
        } else {
            super.successHandler(req, res, next);
        }
    }
}

module.exports = OneLoginController;
