"use strict";
var Promise = require("bluebird");
var unirest = require("unirest");
var _ = require("lodash");

function getQuoteAsync (keyword) {
    function formatQuote (quoteBody) {
        return "\"" + quoteBody.contents.quote + "\"\n\t-" + quoteBody.contents.author;
    }

    return new Promise(function (resolve, reject) {
        unirest.get("https://theysaidso.p.mashape.com/quote?query=" + keyword)
            .header("X-Mashape-Key", config.get("mashapeKey"))
            .header("Accept", "application/json")
            .end(function (result) {
                resolve(formatQuote(result.body));
            });
    });
}

module.exports = function (bot) {
    bot
        .on(bot.triggers['mention-command'], 'quote', ['keyword'])
        .do(function(bot, conf, args) {
            var that = this;
            var keyword = args.commandArgs.keyword;

            getQuoteAsync(keyword).then(function (quote) {
                that.reply(quote);
            });
        });
};

