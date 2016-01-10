"use strict";

var mongoose = require("mongoose");
var User = mongoose.model(require("../../schemas/User"));
var privateMsg = require("../triggers/privateMessage");

module.exports = function (bot) {
    bot.on(privateMsg, "verify", ["token"])
        .do(function (bot, conf, args) {
            var discordId = args.message.author.id;
            var token = args.commandArgs.token;
            var that = this;

            User.findOne({discordId: discordId}).then(function (verifiedUser) {
                if (verifiedUser) {
                    that.reply("Your discord account is already verified as " +
                        verifiedUser.steamProfile.displayName);
                    return;
                }
                if (!token) {
                    that.reply("Must supply a token to verify");
                    return;
                }

                return User.findOne({discordToken: token}).then(function (user) {
                    if (!user) {
                        that.reply("The supplied token doesn't match any known users. Have you registered?");
                        return;
                    }

                    user.discordId = discordId;
                    user.discordToken = null;
                    return user.save();
                }).then(function (newUser) {
                    that.reply("Successfully verified as " + newUser.steamProfile.displayName);
                });
            }).onReject(function (err) {
                console.error("Error during verification: " + err);
                that.reply("Verification failed, something weird happened.")
            }).end();
        });
};