const logout = require(APP_ROOT + "/lib/logout");
const { config } = require("hmpo-app");

describe("Logout", () => {
    let configStub;
    beforeEach(() => {
        configStub = sinon.stub(config, "get");
        configStub
            .withArgs("one-login.logout_redirect_uri")
            .returns("logout_redirect");
        configStub.withArgs("one-login.url").returns("http://localhost:3000");
        configStub.withArgs("one-login.logout").returns("/logout");
    });

    afterEach(() => {
        config.get.restore();
    });

    it("Should return id token", () => {
        var req = {
            sessionModel: {
                get: sinon.stub(),
            },
        };

        req.sessionModel.get.withArgs("id-token").returns("1234567890");

        expect(logout.getIdToken(req)).to.equal("1234567890");
    });

    it("Should return empty id token", () => {
        var req = {
            sessionModel: {
                get: sinon.stub(),
            },
        };

        req.sessionModel.get.withArgs("id-token").returns(undefined);

        expect(logout.getIdToken(req)).to.equal("");
    });

    it("Should return complete logout url", () => {
        expect(logout.getLogoutUrl()).to.equal("http://localhost:3000/logout");
    });

    it("Should return uuid for state", () => {
        expect(logout.getState()).to.have.lengthOf(36);
    });

    it("Should return logout redirect Uri", () => {
        expect(logout.getRedirectUri()).to.equal("logout_redirect");
    });
});
