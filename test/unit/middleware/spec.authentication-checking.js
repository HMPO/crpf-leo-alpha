const authChecking = require(`${APP_ROOT}/middleware/authentication-checking`);
const { config } = require("hmpo-app");

describe("authentication-checking middleware", () => {
    let req, res, next;

    beforeEach(() => {
        res = { redirect: sinon.stub(), locals: {} };
        sinon.stub(config, "get").withArgs("urls.leo").returns("/");
        next = sinon.spy();
    });

    afterEach(() => {
        config.get.restore();
    });

    it("exports a function", () => {
        authChecking.should.be.a("function");
    });

    it("sets res.local.isAuthenticated property to false when user is not authenticated", () => {
        req = {
            session: {},
            path: "/",
        };

        authChecking(req, res, next);

        res.locals.isAuthenticated.should.equal(false);
        next.should.have.been.calledOnceWithExactly();
    });

    it("Unauthenticated users cannot access protected routes", () => {
        req = {
            session: { isAuthenticated: false },
            path: "/any/path",
        };

        authChecking(req, res, next);

        res.locals.isAuthenticated.should.equal(false);
        next.should.not.have.been.called;
        res.redirect.should.have.been.calledOnceWithExactly("/");
    });

    it("Unauthenticated users can access all pre-sign in pages", () => {
        const preSignInPages = [
            "/",
            "/type-of-certificate",
            "/when-death-registered",
            "/delivery-method",
            "/searching-for-one-person",
            "/user-details",
        ];

        preSignInPages.forEach((page) => {
            req = {
                session: { isAuthenticated: false },
                path: page,
            };

            authChecking(req, res, next);

            res.locals.isAuthenticated.should.equal(false);
        });
        next.should.have.been.callCount(6);
    });

    it("Any URL path is available when user is authenticated", () => {
        req = {
            session: { isAuthenticated: true },
            path: "/any/path",
        };

        authChecking(req, res, next);

        res.locals.isAuthenticated.should.equal(true);
        next.should.have.been.calledOnceWithExactly();
    });
});
