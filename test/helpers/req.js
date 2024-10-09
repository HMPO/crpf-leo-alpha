const reqres = require("reqres");
const Model = require("hmpo-model");

module.exports = (settings) => {
    let req = reqres.req(settings);
    req.sessionModel = req.sessionModel || new Model(req.session.user);
    req.form = req.form || {};
    req.form.values = req.form.values || {};
    return req;
};
