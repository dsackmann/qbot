"use strict";

var config = require("config");
var passport = require("passport");
var SteamStrategy = require("passport-steam").Strategy;

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new SteamStrategy({
    returnURL: config.get("appUrl") + "auth/steam/return",
    realm: config.get("appUrl"),
    apiKey: config.get("steamApiKey")
}, function (identifier, profile, done) {
    profile.identifier = identifier;
    done(null, profile);
}));

module.exports = passport;