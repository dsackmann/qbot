"use strict";

console.log("script executed");

if (!process.env.DISCORD_EMAIL && !process.argv[2]) {
    throw new Error("No credentials");
}

var _ = require("lodash");
var Bot = require('discord-bot');

var bot = new Bot({
    email: process.argv[2] || process.env.DISCORD_EMAIL,
    password: process.argv[3] || process.env.DISCORD_PASS
});

bot.connect(function () {
    console.log("Connected!");
});

require("./behaviors/quote")(bot);

module.exports = bot;