const BaseController = require("hmpo-form-wizard").Controller;
const { config, featureFlag } = require("hmpo-app");

const OneLoginTokenModel = require("../models/one-login-token");
const oneLoginToken = require("../lib/one-login-token");
const OneloginUserInfoModel = require("../models/one-login-user-info");

class OneLoginUserDetailsController extends BaseController {
    get(req, res, next) {
        if (req.query.code) {
            req.sessionModel.set({ "auth-code": req.query.code });
        }
        super.get(req, res, next);
    }

    saveValues(req, res, next) {
        super.saveValues(req, res, (error) => {
            if (error) return next(error);
            if (featureFlag.isEnabled("oneLogin", req)) {
                this.createTokenRequest(req, res, next);
            } else {
                next();
            }
        });
    }

    createTokenRequest(req, res, next) {
        let authCode = req.sessionModel.get("auth-code");
        let signedJwtAssertion = oneLoginToken.getSignedJwtAssertion();
        let model = new OneLoginTokenModel(null, req.modelOptions());
        const data = {
            grant_type: oneLoginToken.GRANT_TYPE,
            redirect_uri: config.get("one-login.redirect_uri"),
            client_assertion: signedJwtAssertion,
            client_assertion_type: oneLoginToken.ASSERTION_TYPE,
            code: authCode,
        };
        model.set(data);
        model.save(null, (error, data) => {
            if (error) return next(error);

            req.sessionModel.set({
                "id-token": data.id_token,
            });
            this.getUserInfo(req, data.access_token, next);
        });
    }

    getUserInfo(req, accessToken, next) {
        const options = {
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + accessToken,
            },
        };
        let oneloginUserInfoModel = new OneloginUserInfoModel(null, options);

        oneloginUserInfoModel.fetch((err, data) => {
            if (err) {
                req.session["isAuthenticated"] = false;
                return next(err);
            }
            req.sessionModel.set("one-login-email-address", data.email);
            req.sessionModel.set("one-login-phone-number", data.phone_number);
            req.sessionModel.set("one-login-subject-id", data.sub);
            req.session["isAuthenticated"] = true;
            next();
        });
    }

    successHandler(req, res, next) {
        super.successHandler(req, res, next);
    }
}

module.exports = OneLoginUserDetailsController;
