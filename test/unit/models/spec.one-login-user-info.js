const { config } = require("hmpo-app");
const Model = require(APP_ROOT + "/models/one-login-user-info");
const BaseModel = require("hmpo-model");

describe("One Login user info model", () => {
    let configStub;

    beforeEach(() => {
        configStub = sinon.stub(config, "get");
        configStub
            .withArgs("one-login.url")
            .returns("https://oidc.integration.account.gov.uk")
            .withArgs("proxy")
            .returns("");
    });

    afterEach(() => {
        configStub.restore();
    });

    it("extends the base model", () => {
        const model = new Model();
        model.should.be.an.instanceOf(BaseModel);
    });

    it("gets user info url from config", () => {
        const model = new Model();
        model
            .url()
            .should.equal("https://oidc.integration.account.gov.uk/userinfo");
    });

    describe("proxy settings for token request", () => {
        it("proxies https request if proxy is present", () => {
            configStub.withArgs("proxy").returns("http://localhost:80");
            const model = new Model();
            const httpAgent = model.requestConfig(config).agent;
            expect(httpAgent).to.not.be.undefined;
            expect(httpAgent.https).to.not.be.undefined;
            httpAgent.https.proxy.uri.should.equal("http://localhost:80");
        });

        it("proxies http request if proxy is present", () => {
            configStub
                .withArgs("one-login.url")
                .returns("http://oidc.integration.account.gov.uk");
            configStub.withArgs("proxy").returns("http://localhost:80");
            const model = new Model();
            const httpAgent = model.requestConfig(config).agent;
            expect(httpAgent).to.not.be.undefined;
            expect(httpAgent.http).to.not.be.undefined;
            httpAgent.http.proxy.uri.should.equal("http://localhost:80");
        });

        it("does not proxy request", () => {
            const model = new Model();
            expect(model.requestConfig(config).get()).to.be.undefined;
        });
    });
});
