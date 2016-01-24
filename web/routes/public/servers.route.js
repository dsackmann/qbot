"use strict";

var tf2ServerService = require("../../lib/tf2ServerService").getInstance();
module.exports = function (app) {
    app.get("/servers", function (req, res, next) {
        tf2ServerService.getAllServersWithPlayers().then(function (serverInfos) {
            res.json(serverInfos);
        }).onReject(next);
    });
};