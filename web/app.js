"use strict";

var config = require("config");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var express = require("express");
var mongoose = require("mongoose");

var app = express();

app.locals.bot = require("../bot");
app.locals.models = {
    User: mongoose.model(require("../schemas/User.js"))
};

app.use(cookieParser());
app.use(bodyParser());
app.use(session({
    secret: config.get("sessionSecret"),
    store: new MongoStore({url: config.get("mongoURI")})
}));

require("./routes/public")(app);

app.use(function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/");
});

require("./routes/authenticated")(app);

mongoose.connect(config.get("mongoURI"));

mongoose.connection
    .on("error", function (err) {
        console.error("mongo connection error: " + err);
    })
    .once("open", function() {
        app.listen(process.env.PORT);
        console.log("listening on port " + process.env.PORT);

        app.locals.bot.connect(function () {
            console.log("bot connected");
        });
    });