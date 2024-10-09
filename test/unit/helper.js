const chai = require("chai");
const nunjucksTest = require("hmpo-nunjucks-test");
const path = require("path");

global.should = chai.should();
global.expect = chai.expect;
global.sinon = require("sinon");
global.APP_ROOT = require("path").resolve(__dirname, "../../");
global.request = require("../helpers/req");
global.response = require("reqres").res;
global.proxyquire = require("proxyquire").noCallThru().noPreserveCache();

chai.use(require("sinon-chai"));

const hmpoLogger = require("hmpo-logger");
hmpoLogger.config({ app: false, error: false, console: false });
const logger = hmpoLogger.get();
sinon.stub(logger, "info");
sinon.stub(logger, "error");

const views = [
    path.resolve(APP_ROOT, "views"),
    path.resolve(APP_ROOT, "node_modules", "hmpo-components", "components"),
    path.resolve(APP_ROOT, "node_modules", "govuk-frontend"),
    path.resolve(APP_ROOT, "node_modules", "govuk-frontend", "components"),
];

const locales = [path.resolve(APP_ROOT, "locales", "en")];

global.render = nunjucksTest.renderer(views, locales);
global.cleanHtml = nunjucksTest.cleanHtml;
