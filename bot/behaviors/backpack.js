"use strict";

var SteamApi = require("steam-api");
var items = new SteamApi.Items();
var config = require("config");
var mongoose = require("mongoose");
var User = mongoose.model(require("../../schemas/User"));
var _ = require("lodash");
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

var backpackInfoTmpl = _.template("{{username}} has {{numTotal}} TF2 items, including:\n\t\t" +
    "{{numUnusual || 0}} unusual,\n\t\t" +
    "{{numStrange || 0}} strange,\n\t\t" +
    "and {{numCollectors || 0}} collector's items.");


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
                    that.reply("Can't get backpack for " + targetUser.username +
                        " because they haven't registered their steam account with qbot\n" +
                        "send them here: https://gentle-gorge-8250.herokuapp.com/auth/steam to register\n" +
                        "(100% not a phishing scam)");
                    return;
                }

                return items.GetPlayerItems(440, user.steamId).then(function (itemManifest) {
                    if (itemManifest.status === 15) {
                        that.reply(targetUser.username + "'s backpack is private!");
                        return;
                    }

                    var templateModel = _.extend({username: targetUser.username},
                    parseManifest(itemManifest));

                    that.reply(backpackInfoTmpl(templateModel));
                });
            }).onReject(function (err) {
                console.error("Error fetching backpack for user: " + targetUser + ". Error: " + err);
                that.reply("Couldn't fetch backpack, something went wrong");
            }).end();
        });
};