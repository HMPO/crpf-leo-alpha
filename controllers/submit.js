"use strict";

const { Controller } = require("hmpo-form-wizard");
const Model = require("../models/submit");

class Submit extends Controller {
    saveValues(req, res, next) {
        super.saveValues(req, res, (err) => {
            if (err) return next(err);

            const data = {
                chosenColor: req.sessionModel.get("color"),
                yourAge: req.sessionModel.get("age"),
                fullName: req.sessionModel.get("name"),
            };
            const model = new Model(data);

            model.save((err) => {
                if (err) {
                    return next(err);
                }

                next();
            });
        });
    }
}

module.exports = Submit;
