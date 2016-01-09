"use strict";

console.log("script executed");

if (!process.env.DISCORD_EMAIL && !process.argv[2]) {
    throw new Error("No credentials");
}

var Promise = require("bluebird");
var unirest = require("unirest");
var _ = require("lodash");
var Bot = require('discord-bot');

var bot = new Bot({
    email: process.argv[2] || process.env.DISCORD_EMAIL,
    password: process.argv[3] || process.env.DISCORD_PASS
});

bot
    .on(bot.triggers['mention-command'], 'quote', ['keyword'])
    .do(function(bot, conf, args) {
        var that = this;
        var keyword = args.commandArgs.keyword;

        getQuoteAsync(keyword).then(function (quote) {
            that.reply(quote);
        });
    });

bot.connect(function () {
    console.log("Connected!");
});

function getQuoteAsync (keyword) {
    function formatQuote (quoteBody) {
        return "\"" + quoteBody.contents.quote + "\"\n\t-" + quoteBody.contents.author;
    }

    return new Promise(function (resolve, reject) {
        unirest.get("https://theysaidso.p.mashape.com/quote?query=" + keyword)
            .header("X-Mashape-Key", "qf7m0x0vZYmshpWc0QZzZ9yuktEhp1Gn6NGjsnwGzFei02XzjF")
            .header("Accept", "application/json")
            .end(function (result) {
                resolve(formatQuote(result.body));
            });
    });
}