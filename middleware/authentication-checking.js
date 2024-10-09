const { config } = require("hmpo-app");

module.exports = (req, res, next) => {
    const isAuthenticated = req.session.isAuthenticated || false;
    const root_url = config.get("urls.leo");
    const preSignInPages = [
        "/",
        "/type-of-certificate",
        "/when-death-registered",
        "/delivery-method",
        "/searching-for-one-person",
        "/user-details",
        "/cookies"
    ];

    res.locals.isAuthenticated = isAuthenticated;
    
    if (isAuthenticated) {
        return next();
    }

    // Exclude non-protected pre-sign in pages from authentication check
    if (!isAuthenticated && preSignInPages.indexOf(req.path) > -1) {
        return next();
    }

    res.redirect(root_url);
};
