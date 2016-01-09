"use strict";

var config = require("config");
var passport = require("passport");
var SteamStrategy = require("passport-steam").Strategy;

function getSteamIdFromIdUrl(idUrl) {
    return idUrl.substr(idUrl.lastIndexOf("/") + 1);
}

module.exports = function (app) {
    var User = app.locals.models.User;

    passport.serializeUser(function (user, done) {
        done(null, user.steamId);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({steamId: id}).then(function (user) {
            done(null, user);
        }, done).end();
    });

    passport.use(new SteamStrategy({
        returnURL: config.get("appUrl") + "auth/steam/return",
        realm: config.get("appUrl"),
        apiKey: config.get("steamApiKey")
    }, function (identifier, profile, done) {
        var steamId = getSteamIdFromIdUrl(identifier);

        User.findOne({steamId: steamId}).then(function (user) {
            if (!user) {
                console.log("login from new user with id " + steamId);

                return User.create({
                    steamId: steamId,
                    steamProfile: profile
                });
            }

            user.steamProfile = profile;
            return user.save();
        }).then(function (user) {
            done(null, user);
        }).end();
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get("/auth/steam*",
        passport.authenticate("steam", {failureRedirect: "/"}),
        function (req, res) {
            res.redirect("/auth/success");
        });
};