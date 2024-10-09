const BaseController = require("hmpo-form-wizard").Controller;
const Controller = require(APP_ROOT + "/controllers/logout");
const logout = require(APP_ROOT + "/lib/logout");

describe("Logout Controller", () => {
    let controller, options, req, res, next;

    beforeEach(() => {
        options = {
            route: "/logout",
        };
        req = request({
            featureFlags: { oneLogin: true },
            journeyModel: {
                set: sinon.stub(),
            },
            sessionModel: {
                get: sinon.stub(),
            },
            session: {
                destroy: sinon.stub(),
                isAuthenticated: true,
            },
        });

        res = response();
        next = sinon.stub();
        controller = new Controller(options);
        sinon
            .stub(logout, "getLogoutUrl")
            .returns(
                "https://one-login/logout?id_token_hint=<%= idToken %>&post_logout_redirect_uri=<%= logoutRedirectUri %>&state=<%= state %>",
            );
        sinon.stub(logout, "getRedirectUri").returns("https://localhost:3000");
        sinon.stub(logout, "getIdToken").withArgs(req).returns("01234567890");
        sinon.stub(logout, "getState").returns("1111-2222-33333-4444");
    });

    afterEach(() => {
        logout.getLogoutUrl.restore();
        logout.getRedirectUri.restore();
        logout.getIdToken.restore();
        logout.getState.restore();
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
        });

        afterEach(() => {
            BaseController.prototype.successHandler.restore();
        });

        it("Send authenticated user to One Login logout", () => {
            controller.successHandler(req, res, next);
            res.redirect.should.have.been.called.calledWithExactly(
                "https://one-login/logout?id_token_hint=01234567890&post_logout_redirect_uri=https://localhost:3000&state=1111-2222-33333-4444",
            );
            req.session.destroy.should.have.been.callCount(1);
        });

        it("Send non-authenticated user to start page", () => {
            req.session["isAuthenticated"] = false;
            controller.successHandler(req, res, next);
            res.redirect.should.have.been.called.calledWithExactly(
                "https://localhost:3000",
            );
            req.session.destroy.should.have.been.callCount(1);
        });

        it("Send authenticated user to start page when one Logion is disabled", () => {
            req.featureFlags.oneLogin = false;
            controller.successHandler(req, res, next);
            res.redirect.should.have.been.called.calledWithExactly(
                "https://localhost:3000",
            );
            req.session.destroy.should.have.been.callCount(1);
        });
    });
});
