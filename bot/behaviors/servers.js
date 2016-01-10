"use strict";

var SteamApi = require("steam-api");
var steamUsers = new SteamApi.User();
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
                var servers = _(playerSummaries)
                    .filter(function (player) {
                        return player.gameserverip && player.gameserverip !== "0.0.0.0:0";
                    })
                    .groupBy("gameserverip");

                var playerCounts = servers.mapValues("length").value();
                that.reply(playerCounts);
            }).onReject(function (err) {
                console.error("Error fetching servers: " + err);
                that.reply("Couldn't get servers, something went wrong");
            }).end();
        });
};