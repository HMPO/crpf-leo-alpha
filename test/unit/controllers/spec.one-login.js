const BaseController = require("hmpo-form-wizard").Controller;
const Controller = require(APP_ROOT + "/controllers/one-login");
const oneLoginAuthorize = require(APP_ROOT + "/lib/one-login-authorize");

describe("One Login Controller", () => {
    let controller, options, req, res, next, searchingForOnePersonRadioStub;

    beforeEach(() => {
        searchingForOnePersonRadioStub = sinon.stub();
        searchingForOnePersonRadioStub.returns("yes");
        options = {
            route: "/one-login",
        };
        req = request({
            featureFlags: { oneLogin: true },
            sessionModel: {
                get: searchingForOnePersonRadioStub,
            },
        });
        res = response();
        next = sinon.stub();
        controller = new Controller(options);
        sinon
            .stub(oneLoginAuthorize, "getAuthorizeRequestObject")
            .returns("beautifulshinytoken");
        sinon
            .stub(oneLoginAuthorize, "getAuthorizeUrl")
            .returns(
                "https://localhost:3000/authorize?response_type=<%= responseType %>&scope=<%= scope %>&client_id=<%= clientId %>&request=<%= requestParam %>",
            );
        sinon.stub(oneLoginAuthorize, "getClientId").returns("clientid");
    });

    afterEach(() => {
        oneLoginAuthorize.getAuthorizeRequestObject.restore();
        oneLoginAuthorize.getAuthorizeUrl.restore();
        oneLoginAuthorize.getClientId.restore();
    });

    it("exports a function", () => {
        Controller.should.be.a("function");
    });

    it("is an instance of BaseController", () => {
        controller.should.be.an.instanceOf(BaseController);
    });

    describe("successHandler", () => {
        beforeEach(() => {
            sinon.stub(BaseController.prototype, "successHandler");
            sinon.stub(BaseController.prototype, "setStepComplete");
        });

        afterEach(() => {
            BaseController.prototype.successHandler.restore();
            BaseController.prototype.setStepComplete.restore();
        });

        it("Send user to govuk onelogin if they have selected yes", () => {
            controller.successHandler(req, res, next);
            expect(req.session["isAuthenticated"]).to.equal(false);
            res.redirect.should.have.been.called.calledWithExactly(
                "https://localhost:3000/authorize?response_type=code&scope=openid email phone&client_id=clientid&request=beautifulshinytoken",
            );
        });

        it("Call parent success handler if oneLogin feature flag is disabled", () => {
            req.featureFlags.oneLogin = false;
            searchingForOnePersonRadioStub.returns("yes");
            controller.successHandler(req, res, next);
            BaseController.prototype.successHandler.should.have.been.calledWithExactly(
                req,
                res,
                next,
            );
        });

        it("Call parent success handler if they have selected no", () => {
            searchingForOnePersonRadioStub.returns("no");
            controller.successHandler(req, res, next);
            BaseController.prototype.successHandler.should.have.been.calledWithExactly(
                req,
                res,
                next,
            );
        });

        it("Call parent success handler if they have selected i don't know", () => {
            searchingForOnePersonRadioStub.returns("i don't know");
            controller.successHandler(req, res, next);
            BaseController.prototype.successHandler.should.have.been.calledWithExactly(
                req,
                res,
                next,
            );
        });
    });
});
