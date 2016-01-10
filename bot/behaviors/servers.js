"use strict";

var SteamApi = require("steam-api");
var steamUsers = new SteamApi.User();
var tf2ServerService = require("../services/tf2ServerService");
var mongoose = require("mongoose");
var User = mongoose.model(require("../../schemas/User"));
var _ = require("lodash");
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;


module.exports = function (bot) {
    bot
        .on(bot.triggers['command'], 'servers')
        .do(function (bot, conf, args) {
            console.log("servers requested");
            var that = this;

            User.find({}, "steamId").then(function (users) {
                var ids = users.map(function (user) {
                    return user.steamId;
                });

                return steamUsers.GetPlayerSummaries(ids.join());
            }).then(function (playerSummaries) {
                var serverInfoPromises = _(playerSummaries)
                    .filter(function (player) {
                        return player.gameserverip && player.gameserverip !== "0.0.0.0:0";
                    })
                    .groupBy("gameserverip")
                    .map(function (players, serverAddr) {
                        var playerNames = _.map(players, "personaname");

                        return tf2ServerService.getServerInfo(serverAddr).then(function (serverInfo) {
                            return _.extend(serverInfo, {playerNames: playerNames});
                        });
                    })
                    .value();

                return Promise.all(serverInfoPromises);
            }).then(function (serverInfos) {
                that.reply(serverInfos.map(function (si) {
                    return JSON.stringify(si, null, 2);
                }).join("\n"));
            }).onReject(function (err) {
                console.error("Error fetching servers: " + err);
                that.reply("Couldn't get servers, something went wrong");
            }).end();
        });
};