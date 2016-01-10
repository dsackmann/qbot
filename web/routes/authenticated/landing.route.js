"use strict";

module.exports = function (app) {
    app.get("/auth/success", function (req, res) {
        if (req.user.dicordId) {
            return res.send("You're verified with qbot!");
        }

        if (!req.user.discordToken) {
            req.user.discordToken = Math.random().toString(16).slice(-6);
        }

        req.user.save().then(function () {
            res.send("Your verification token is " + req.user.discordToken +".\n\n" +
            "Send this message: \n verify " + req.user.discordToken + "\n\n" +
                "to qbot in a private message to link your steam and discord accounts");
        });
    });
};