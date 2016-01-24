"use strict";

module.exports = function (app) {
  require("./default.route.js")(app);
  require("./steamAuth.route.js")(app);
  require("./servers.route.js")(app);
};