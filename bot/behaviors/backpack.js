"use strict";

var config = require("config");
var Promise = require("bluebird");
var unirest = require("unirest");
var mongoose = require("mongoose");
var User = mongoose.model(require("../../schemas/User"));
var _ = require("lodash");
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

var backpackInfoTmpl = _.template("{{username}} has {{numTotal}} TF2 items, including:\n\t\t" +
    "{{numUnusual}} unusual,\n\t\t" +
    "{{numStrange}} strange,\n\t\n" +
    "and {{numCollectors}} collector's items.");

function getItemsAsync(steamId) {
    var url = "http://api.steampowered.com/IEconItems_440/GetPlayerItems/v0001/?" +
        "key=" + config.get("steamApiKey") + "&" +
        "SteamID=" + steamId;

    console.log("requesting: " + url);
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

function parseManifest(itemManifest) {
    var counts = _(itemManifest.items)
        .map(function (item) {
            return item.quality
        }).countBy().value();

    return {
        numTotal: itemManifest.items.length,
        numUnusual: counts['5'],
        numStrange: counts['11'],
        numCollectors: counts['14']
    }
}

module.exports = function (bot) {
    bot
        .on(bot.triggers['command'], 'backpack', ["@user"])
        .do(function (bot, conf, args) {
            console.log("backpack requested");
            var that = this;

            var targetUser = args.commandArgs.user;

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
                        that.reply(targetUser.name + "'s backpack is private!");
                        return;
                    }

                    var templateModel = _.extend({username: targetUser.name},
                    parseManifest(itemManifest));

                    that.reply(backpackInfoTmpl(templateModel));
                });
            }).onReject(function (err) {
                console.error("Error fetching backpack for user: " + targetUser + ". Error: " + err);
                that.reply("Couldn't fetch backpack, something went wrong");
            }).end();
        });
};