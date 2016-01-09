module.exports = function (app) {

    app.get("/", function (req, res) {
        res.send("uptime: " + app.locals.bot.client.uptime);
    });

};