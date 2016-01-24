"use strict";
var _ = require("lodash");
var Promise = require("bluebird");

function Tf2ServerService(User, steamUsers, gameServerQuery) {
    this.User = User;
    this.steamUsers = steamUsers;
    this.gameServerQuery = gameServerQuery;
}

Tf2ServerService.prototype = {
    getServerInfo: function (address) {
        var that = this;
        var colonIndex = address.indexOf(":");
        var host = address.slice(0, colonIndex);
        var port = parseInt(address.slice(colonIndex + 1, address.length), 10);

        console.log("host: " + host);
        console.log("port: " + port);
        return new Promise(function (resolve, reject) {

            that.gameServerQuery({
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
    },

    getAllServersWithPlayers: function () {
        var that = this;

        return this.User.find({}, "steamId").then(function (users) {
            var ids = users.map(function (user) {
                return user.steamId;
            });

            return that.steamUsers.GetPlayerSummaries(ids.join());
        }).then(function (playerSummaries) {
            var serverInfoPromises = _(playerSummaries)
                .filter(function (player) {
                    return player.gameserverip && player.gameserverip !== "0.0.0.0:0";
                })
                .groupBy("gameserverip")
                .map(function (players, serverAddr) {
                    var playerNames = _.map(players, "personaname");

                    return that.getServerInfo(serverAddr).then(function (serverInfo) {
                        return _.extend(serverInfo, {playerNames: playerNames});
                    });
                })
                .value();

            return Promise.all(serverInfoPromises);
        });
    }
};

module.exports = Tf2ServerService;

module.exports.getInstance = function() {
    var mongoose = require("mongoose");
    var User = mongoose.model(require("../schemas/User"));

    var SteamApi = require("steam-api");
    var steamUsers = new SteamApi.User();

    return new Tf2ServerService(User, steamUsers, require("game-server-query"));
};