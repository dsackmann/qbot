var Base = require("../../node_modules/discord-bot/src/triggers/command");
var util = require("util");

function PrivateMessage (command, argsName) {
    Base.call(this, command, argsName);
}

util.inherits(PrivateMessage, Base);

PrivateMessage.prototype.run = function (bot) {
    var that = this;

    bot.client.on('message', function(message) {
        if (!message.isPrivate) {
            return;
        }
        var args;
        var cmd;
        var mapMentions = message.mentions;

        args = that._parseArgs(message.content);
        cmd = args.shift();

        if (cmd != that.command)
            return;

        if (that.argsName) {
            args = that._mapArgs(args, mapMentions, that.argsName);
        }

        that.execute(bot, {
            message: message,
            commandArgs: args
        });
    });
};
