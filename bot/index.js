"use strict";

var config = require("config");
var _ = require("lodash");
var Bot = require('discord-bot');

var bot = new Bot(config.get("discord"));

bot.connect(function () {
    console.log("Connected!");
});

require("./behaviors/quote")(bot);

module.exports = bot;