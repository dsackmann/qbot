"use strict";

module.exports = function (app) {
    app.get("/addUser", function (req, res) {
       res.render('<form method="post" name=newUser><input name="steamId"/></form>')
    });

    app.post("/addUser", function (req, res) {
        var User = app.locals.models.User;

        User.create({steamId: req.body.newUser.steamId}).then(function () {
            res.redirect("/addUser");
        }).onReject(function (err) {
            res.status(500).send(err);
        })
    });
};