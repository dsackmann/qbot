"use strict";

var config = require("config");
var _ = require("lodash");
var Bot = require('discord-bot');

var bot = new Bot(config.get("discord"));

require("./behaviors/quote")(bot);
require("./behaviors/verify")(bot);
require("./behaviors/backpack")(bot);

module.exports = bot;