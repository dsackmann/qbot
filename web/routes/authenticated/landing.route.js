"use strict";

module.exports = function (app) {
    app.get("/auth/success", function (req, res) {
        res.send(req.user);
    });
};