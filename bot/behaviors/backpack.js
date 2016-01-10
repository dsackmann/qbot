"use strict";

var config = require("config");
var Promise = require("bluebird");
var unirest = require("unirest");
var mongoose = require("mongoose");
var User = mongoose.model(require("../../schemas/User"));
var _ = require("lodash");

function getItemsAsync(steamId) {
    var url = "http://api.steampowered.com/IEconItems_440/GetPlayerItems/v0001/?" +
        "key=" + config.get("steamApiKey") + "&" +
        "SteamID=" + steamId;

    return new Promise(function (resolve, reject) {
        unirest.get(url)
            .header("Accept", "application/json")
            .end(function (response) {
                if (response.code < 400) {
                    resolve(response.body);
                } else {
                    reject(response.body);
                }
            });
    });
}

module.exports = function (bot) {
    bot
        .on(bot.triggers['mention-command'], 'backpack', ['user'])
        .do(function(bot, conf, args) {
            console.log("backpack requested for " + args.commandArgs.user);

            var that = this;
            var userName = args.commandArgs.user.substr(1);

            var targetUser = _(args.message.mentions)
                .find(function (mention) {
                    return mention.name === userName;
                }).value();

            if (!targetUser) {
                this.reply("who the fuck is that?");
                return;
            }

            User.findOne({discordId: targetUser.id}).then(function (user) {
                if (!user) {
                    that.reply("Can't get backpack for " + user.name +
                        " because they haven't registered their steam account with qbot");
                    return;
                }

                return getItemsAsync(user.steamId).then(function (itemManifest) {
                    that.reply(JSON.stringify(itemManifest, null, 2));
                });
            }).onReject(function (err) {
                console.error("Error fetching backpack for user: " + targetUser + ". Error: " + err);
                that.reply("Couldn't fetch backpack, something went wrong");
            }).end();
        });
};