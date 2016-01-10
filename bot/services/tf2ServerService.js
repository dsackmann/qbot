"use strict";
var _ = require("lodash");
var Promise = require("bluebird");
var query = require("game-server-query");

function Tf2ServerService() {
}

Tf2ServerService.prototype = {
    getServerInfo: function (address) {
        var colonIndex = address.indexOf(":");
        var host = address.slice(0, colonIndex);
        var port = address.slice(colonIndex + 1, address.length);

        console.log("host: " + host);
        console.log("port: " + port);
        return new Promise(function (resolve, reject) {

            query({
                type: "tf2",
                host: host,
                port: port
            }, function (response) {
                if (response.error) {
                    reject(response);
                } else {
                    resolve(response);
                }
            });
        }).then(function (serverInfo) {
            return {
                serverName: serverInfo.name,
                map: serverInfo.map,
                totalPlayers: serverInfo.players.length,
                maxPlayers: serverInfo.maxplayers
            }
        });
    }
};

module.exports = new Tf2ServerService();