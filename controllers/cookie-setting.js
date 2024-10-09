'use strict';

const BaseController = require('hmpo-form-wizard').Controller;

class CookiesSetting extends BaseController {

    render(req, res, next) {
        if (req.cookies.cookie_preferences) {
            req.form.values['cookies-setting'] = JSON.parse(req.cookies.cookie_preferences).additional;
        }
        super.render(req, res, next);
    }

    successHandler(req, res) {
        if (req.sessionModel.get('cookies-setting') === "enable") {
            res.cookie("cookie_preferences",
                JSON.stringify({ "additional": "enable" }), {
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                    maxAge: 365 * 24 * 60 * 60 * 1000
                });
        }

        if (req.sessionModel.get('cookies-setting') === "disable") {
            res.cookie("cookie_preferences",
                JSON.stringify({ "additional": "disable" }), {
                    httpOnly: true,
                    secure: true,
                    sameSite: "Strict",
                    maxAge: 365 * 24 * 60 * 60 * 1000
                });
        }

        res.redirect('/help/cookies')
    }

}

module.exports = CookiesSetting;
