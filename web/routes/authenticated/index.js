"use strict";

module.exports = function (app) {
    require("./landing.route.js")(app);
    require("./admin.route.js")(app);
};