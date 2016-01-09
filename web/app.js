"use strict";

var config = require("config");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var express = require("express");
var bot = require("../bot");
var passport = require("./steamPassport");

var app = express();

app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: Math.random().toString(16).slice(-8),
    store: new MongoStore({url: config.get("mongoURI")})
}));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", function (req, res) {
    res.send("uptime: " + bot.client.uptime);
});

app.get("/auth/success", checkAuth, function (req, res) {
    res.send(req.user);
});

app.get("/auth/steam*", passport.authenticate("steam", {failureRedirect: "/"}));

app.get("/auth/steam", function (req, res) {
    res.redirect("/auth/success");
});

app.get("/auth/steam/return", function (req, res) {
    res.redirect("/auth/success");
});

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/");
}

app.listen(process.env.PORT);