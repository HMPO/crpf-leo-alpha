const { config } = require("hmpo-app");
const Model = require(APP_ROOT + "/models/one-login-token");
const BaseModel = require("hmpo-model");
const oneLoginToken = require("../../../lib/one-login-token");

describe("one login token model", () => {
    let configStub, data;
    beforeEach(() => {
        configStub = sinon.stub(config, "get");
        configStub
            .withArgs("one-login.url")
            .returns("https://oidc.integration.account.gov.uk")
            .withArgs("proxy")
            .returns("");
        data = {
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/user-details",
            client_assertion: "signedJwt",
            client_assertion_type: oneLoginToken.ASSERTION_TYPE,
            code: "token",
        };
    });

    afterEach(() => {
        configStub.restore();
    });

    it("extends the base model", () => {
        const model = new Model();
        model.should.be.an.instanceOf(BaseModel);
    });

    it("gets token url from config", () => {
        const model = new Model();
        model
            .url()
            .should.equal("https://oidc.integration.account.gov.uk/token");
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

    describe("prepare", () => {
        let cb, model;

        beforeEach(() => {
            cb = sinon.stub();
            model = new Model();
            model.set(data);
        });

        it("calls callback with payload ", () => {
            model.prepare(cb);
            cb.should.have.been.calledWithExactly(null, data);
        });
    });

    describe("save", () => {
        let cb, model;

        beforeEach(() => {
            sinon.stub(BaseModel.prototype, "prepare");
            cb = sinon.stub();
            model = new Model();
            model.request = sinon.stub();
        });

        afterEach(() => {
            BaseModel.prototype.prepare.restore();
        });

        it("model is sent as multiform data ", () => {
            BaseModel.prototype.prepare.yields(null, data);
            model.save(null, cb);
            model.request.should.have.been.calledWithExactly(
                {
                    method: "POST",
                    body: sinon.match(
                        "grant_type=authorization_code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fuser-details&client_assertion=signedJwt&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&code=token",
                    ),
                    headers: {
                        "Content-Type": sinon.match(
                            "application/x-www-form-urlencoded;charset=UTF-8",
                        ),
                    },
                    timeout: sinon.match.object,
                    url: sinon.match(
                        "https://oidc.integration.account.gov.uk/token",
                    ),
                },
                cb,
            );
        });
    });
});
