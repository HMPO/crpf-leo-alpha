module.exports = (req, res, next) => {

    const additionalCookiePreference = req.query.additionalCookies;
    const hideCookieBanner = req.query.hideCookieBanner;

    if (!req.cookies.cookie_preferences) {
        res.locals.hideCookieBanner = false;
        res.locals.hideCookieBannerContent = false;
        res.locals.hideCookieRejectText = true;
        res.locals.hideCookieAcceptText = true;
        res.locals.hideCookieBannerRemoveBtn = true;
    }

    if (req.cookies.cookie_preferences) {
        res.locals.hideCookieBanner = true;
    }

    if (additionalCookiePreference === "enable") {
        res.cookie("cookie_preferences",
            JSON.stringify({ "additional": "enable" }), {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 365 * 24 * 60 * 60 * 1000
            });

        res.locals.hideCookieBanner = false;
        res.locals.hideCookieBannerContent = true;
        res.locals.hideCookieRejectText = true;
        res.locals.hideCookieAcceptText = false;
        res.locals.hideCookieBannerRemoveBtn = false;

    }

    if (additionalCookiePreference === "disable") {
        res.cookie("cookie_preferences",
            JSON.stringify({ "additional": "disable" }), {
                httpOnly: true,
                secure: true,
                sameSite: "Strict",
                maxAge: 365 * 24 * 60 * 60 * 1000
            });

        res.locals.hideCookieBanner = false;
        res.locals.hideCookieBannerContent = true;
        res.locals.hideCookieRejectText = false;
        res.locals.hideCookieAcceptText = true;
        res.locals.hideCookieBannerRemoveBtn = false;
    }

    if (hideCookieBanner === "yes") {
        res.locals.hideCookieBanner = true;
    }

    next();
};
