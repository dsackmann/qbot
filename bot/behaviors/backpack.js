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

    console.log("requesting: "  + url);
    return new Promise(function (resolve, reject) {
        unirest.get(url)
            .header("Accept", "application/json")
            .end(function (response) {
                if (response.code < 400) {
                    resolve(response.body.result);
                } else {
                    reject(response.body);
                }
            });
    });
}

module.exports = function (bot) {
    bot
        .on(bot.triggers['mention-command'], 'backpack')
        .do(function(bot, conf, args) {
            console.log("backpack requested");
            var that = this;

            var targetUser = _.find(args.message.mentions, function (mention) {
                return mention.name !== bot.client.user.name;
            });

            if (!targetUser) {
               targetUser = args.message.author;
            }

            User.findOne({discordId: targetUser.id}).then(function (user) {
                if (!user) {
                    that.reply("Can't get backpack for " + user.name +
                        " because they haven't registered their steam account with qbot");
                    return;
                }

                return getItemsAsync(user.steamId).then(function (itemManifest) {
                    if (itemManifest.status === 15) {
                        that.reply("User's backpack is private!");
                        return;
                    }

                    that.reply(JSON.stringify(itemManifest, null, 2));
                });
            }).onReject(function (err) {
                console.error("Error fetching backpack for user: " + targetUser + ". Error: " + err);
                that.reply("Couldn't fetch backpack, something went wrong");
            }).end();
        });
};