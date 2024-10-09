const oneLoginToken = require(APP_ROOT + "/lib/one-login-token");
const { config } = require("hmpo-app");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { expect } = require("chai");

describe("One Login Token", () => {
    let configStub;
    const MOCK_JWT =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRoaXMgaXMgYSBqd3QiLCJpYXQiOjE1MTYyMzkwMjJ9.E40wj3F8bmItGs-6BOlHHEYY9rTJ13iOHowtyMX-3Bo";
    beforeEach(() => {
        configStub = sinon.stub(config, "get");
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

    it("Should sign jwt for token endpoint", () => {
        expect(oneLoginToken.getSignedJwtAssertion()).to.equal(MOCK_JWT);
    });
});
