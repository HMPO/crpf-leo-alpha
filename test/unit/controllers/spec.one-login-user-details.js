const BaseController = require("hmpo-form-wizard").Controller;
const { config } = require("hmpo-app");
const Controller = require(APP_ROOT + "/controllers/one-login-user-details");
const oneLoginToken = require(APP_ROOT + "/lib/one-login-token");
const OneLoginTokenModel = require(APP_ROOT + "/models/one-login-token");
const OneLoginUserInfoModel = require(APP_ROOT + "/models/one-login-user-info");

describe("One Login User Details Controller", () => {
    let controller, options, req, res, next, values, data;

    beforeEach(() => {
        options = {
            route: "/user_details",
        };
        req = request({
            featureFlags: { oneLogin: true },
            journeyModel: {
                set: sinon.stub(),
            },
        });
        values = {
            key: "value",
        };
        sinon
            .stub(config, "get")
            .withArgs("one-login.redirect_uri")
            .returns("http://localhost:3000/user-details");
        res = response();
        next = sinon.stub();
        controller = new Controller(options);
        sinon.stub(oneLoginToken, "getSignedJwtAssertion").returns("signedJwt");
        req.modelOptions = sinon.stub();
    });

    afterEach(() => {
        config.get.restore();
        oneLoginToken.getSignedJwtAssertion.restore();
    });

    it("exports a function", () => {
        Controller.should.be.a("function");
    });

    it("is an instance of BaseController", () => {
        controller.should.be.an.instanceOf(BaseController);
    });

    describe("get", () => {
        beforeEach(() => {
            sinon.stub(BaseController.prototype, "get").yields(null, values);
            req.query = { code: "A123B" };
        });

        afterEach(() => {
            BaseController.prototype.get.restore();
        });

        it("gets values from the parent", () => {
            controller.get(req, res, next);
            BaseController.prototype.get.should.have.been.called;
            expect(req.sessionModel.get("auth-code")).to.eql(
                "A123B",
            );
        });

        it("Auth-code is not set", () => {
            req.query = {};
            controller.get(req, res, next);
            expect(req.sessionModel.get("auth-code")).to.be.undefined;
        });
    });

    describe("saveValues", () => {
        beforeEach(() => {
            sinon.stub(BaseController.prototype, "saveValues").yields(null);
            controller.createTokenRequest = sinon.stub();
            controller.submit = sinon.stub();
            req.sessionModel.set("auth-code", "A123B");
        });

        afterEach(() => {
            BaseController.prototype.saveValues.restore();
        });

        it("calls parent method", () => {
            controller.saveValues(req, res, next);
            BaseController.prototype.saveValues.should.have.been.calledWithExactly(
                req,
                res,
                sinon.match.func,
            );
        });

        it("calls callback with error from parent method", () => {
            let err = new Error();
            BaseController.prototype.saveValues.yields(err);
            controller.saveValues(req, res, next);
            next.should.have.been.calledWithExactly(err);
            controller.submit.should.not.have.been.called;
        });

        it("calls next method when one login feature is disabled", () => {
            req.featureFlags.oneLogin = false;
            req.query = {};
            controller.saveValues(req, res, next);
            controller.createTokenRequest.should.not.have.been.called;
            controller.submit.should.not.have.been.called;
            next.should.have.been.called;
        });

        it("calls callback with error from parent method", () => {
            let err = new Error();
            BaseController.prototype.saveValues.yields(err);
            controller.saveValues(req, res, next);
            next.should.have.been.calledWithExactly(err);
            controller.submit.should.not.have.been.called;
        });
    });

    describe("createTokenRequest", () => {
        beforeEach(() => {
            req.sessionModel.set("auth-code", "A123B");
            sinon.stub(OneLoginTokenModel.prototype, "set");
            sinon
                .stub(OneLoginTokenModel.prototype, "save")
                .yields(null, (data = { access_token: "OneLoginAccessToken" }));
            sinon.stub(Controller.prototype, "getUserInfo");
        });

        afterEach(() => {
            OneLoginTokenModel.prototype.save.restore();
            OneLoginTokenModel.prototype.set.restore();
            Controller.prototype.getUserInfo.restore();
        });

        it("sets all jwt data on the model", () => {
            controller.createTokenRequest(req, res, next);
            OneLoginTokenModel.prototype.set.should.have.been.calledWithExactly(
                {
                    grant_type: "authorization_code",
                    redirect_uri: "http://localhost:3000/user-details",
                    client_assertion: "signedJwt",
                    client_assertion_type: oneLoginToken.ASSERTION_TYPE,
                    code: "A123B",
                },
            );
        });

        it("saves the model", () => {
            controller.createTokenRequest(req, res, next);
            OneLoginTokenModel.prototype.save.should.have.been.called;
        });

        it("calls userinfo with the jwt", () => {
            controller.createTokenRequest(req, res, next);

            OneLoginTokenModel.prototype.set.should.have.been.calledWithExactly(
                {
                    grant_type: "authorization_code",
                    redirect_uri: "http://localhost:3000/user-details",
                    client_assertion: "signedJwt",
                    client_assertion_type: oneLoginToken.ASSERTION_TYPE,
                    code: "A123B",
                },
            );

            data.access_token.should.eql("OneLoginAccessToken");

            Controller.prototype.getUserInfo.should.have.been.calledWithExactly(
                req,
                data.access_token,
                next,
            );
        });

        it("calls next with error", () => {
            let err = new Error();
            OneLoginTokenModel.prototype.save.yields(err);
            controller.createTokenRequest(req, res, next);
            next.should.have.been.calledWithExactly(err);
        });
    });

    describe("getUserInfo", () => {
        beforeEach(() => {
            sinon.stub(OneLoginUserInfoModel.prototype, "fetch").yields(
                null,
                (data = {
                    email: "oneLoginEmailAddress@oneLogin.com",
                    phone_number: "+447777777777",
                    sub: "urn:fdc:gov.uk:2022:XXX",
                }),
            );
        });

        afterEach(() => {
            OneLoginUserInfoModel.prototype.fetch.restore();
        });

        it("Calls OneLogin User Info Endpoint and returns user details", () => {
            const accessToken = "OneloginAccessToken";

            controller.getUserInfo(req, accessToken, next);

            OneLoginUserInfoModel.prototype.fetch.should.have.been.calledWithExactly(
                sinon.match.func,
            );

            expect(req.sessionModel.get("one-login-email-address")).to.eql(
                "oneLoginEmailAddress@oneLogin.com",
            );
            expect(req.sessionModel.get("one-login-phone-number")).to.eql(
                "+447777777777",
            );
            expect(req.sessionModel.get("one-login-subject-id")).to.eql(
                "urn:fdc:gov.uk:2022:XXX",
            );

            expect(req.session.isAuthenticated).to.not.be.undefined;
            expect(req.session.isAuthenticated).to.eql(true);
        });

        it("calls next with error", () => {
            let err = new Error();
            const accessToken = "OneloginAccessToken";
            OneLoginUserInfoModel.prototype.fetch.yields(err);

            controller.getUserInfo(req, accessToken, next);

            next.should.have.been.calledWithExactly(err);
            expect(req.session.isAuthenticated).to.not.be.undefined;
            expect(req.session.isAuthenticated).to.eql(false);
        });
    });

    describe("successHandler", () => {
        beforeEach(() => {
            sinon.stub(BaseController.prototype, "successHandler");
        });

        afterEach(() => {
            BaseController.prototype.successHandler.restore();
        });

        it("calls the parent method", () => {
            controller.successHandler(req, res, next);
            BaseController.prototype.successHandler.should.have.been.calledWithExactly(
                req,
                res,
                next,
            );
        });
    });
});
