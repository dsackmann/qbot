"use strict";

var express = require("express");
var bot = require("../bot");

var app = express();

app.get("/", function (req, res) {
   res.send("uptime: " + bot.client.uptime);
});

app.listen(process.env.PORT);