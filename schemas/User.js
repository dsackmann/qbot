"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var schemaName = "User";

var User = new Schema({
    steamId: {
        type: String,
        index: {
            unique: true
        }
    },
    discordId: {
        type: String,
        index: true
    },
    discordToken: {
        type: String
    },
    steamProfile: {
        type: Schema.Types.Mixed
    }
});

mongoose.model(schemaName, User);

module.exports = schemaName;
