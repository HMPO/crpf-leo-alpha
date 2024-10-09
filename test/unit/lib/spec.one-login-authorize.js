const oneLoginAuthorize = require(APP_ROOT + "/lib/one-login-authorize");
const { config } = require("hmpo-app");
const jwt = require("jsonwebtoken");
const fs = require("fs");

describe("One Login Authorize", () => {
    let configStub;
    const MOCK_JWT =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRoaXMgaXMgYSBqd3QiLCJpYXQiOjE1MTYyMzkwMjJ9.E40wj3F8bmItGs-6BOlHHEYY9rTJ13iOHowtyMX-3Bo";
    beforeEach(() => {
        configStub = sinon.stub(config, "get");
        configStub.withArgs("one-login.client_id").returns("client_id");
        configStub.withArgs("one-login.url").returns("http://localhost:3000");
        configStub.withArgs("one-login.authorize").returns("/authorize");
        configStub
            .withArgs("one-login.redirect_uri")
            .returns("http://localhost:3000/redirect");
        configStub.withArgs("one-login.private-key").returns("someprivatekey");
        sinon.stub(jwt, "sign").returns(MOCK_JWT);
        sinon.stub(fs, "readFileSync").returns("someprivatekey");
    });

    afterEach(() => {
        config.get.restore();
        jwt.sign.restore();
        fs.readFileSync.restore();
    });

    it("Should return complete one login url", () => {
        expect(oneLoginAuthorize.getAuthorizeUrl()).to.equal(
            "http://localhost:3000/authorize",
        );
    });

    it("Should return jwt token", () => {
        expect(oneLoginAuthorize.getAuthorizeRequestObject()).to.equal(
            MOCK_JWT,
        );
    });

    it("Should return clientId", () => {
        expect(oneLoginAuthorize.getClientId()).to.equal("client_id");
    });
});
