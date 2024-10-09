const hmpoFormWizard = require("hmpo-form-wizard");

const steps = require("./steps");
const fields = require("./fields");

module.exports = hmpoFormWizard(steps, fields, {
    journeyName: "triage",
    name: "triage",
    templatePath: "pages/triage",
});
