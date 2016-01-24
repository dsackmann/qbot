"use strict";

var tf2ServerService = require("../../lib/tf2ServerService").getInstance();
var _ = require("lodash");


function getServerInfoResponse (serverInfos) {
    return serverInfos.map(function (server) {
        return _.template(
            "<% _.forEach(playerNames, function(name, i) { %>" +
                "<%- name %> " +
                "<%if (i === playerNames.length - 2) {%>" +
                    "and " +
                "<% } %>" +
            " <% }); %> " +
            "<%= playerNames.length === 1 ? 'is ' : 'are ' %>" +
            "playing <%= map %> on <%= serverName %> (<%= totalPlayers %> / <%= maxPlayers %>)"
        )(server);
    }).join("\n\n");
}

module.exports = function (bot) {
    bot
        .on(bot.triggers['command'], 'servers')
        .do(function (bot, conf, args) {
            console.log("servers requested");
            var that = this;

            tf2ServerService.getAllServersWithPlayers().then(function (serverInfos) {
                if (serverInfos.length === 0) {
                    that.reply("No one is playing right now. Also, fuck pancake");
                    return;
                }

                that.reply(getServerInfoResponse(serverInfos));
            }).onReject(function (err) {
                console.error("Error fetching servers: " + err);
                that.reply("Couldn't get servers, something went wrong");
            }).end();
        });
};