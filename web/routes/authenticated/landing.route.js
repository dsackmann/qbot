"use strict";

module.exports = function (app) {
    app.get("/auth/success", checkAuth, function (req, res) {
        res.send(req.user);
    });
};