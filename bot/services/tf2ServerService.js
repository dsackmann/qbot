"use strict";
var _ = require("lodash");
var url = require("url");
var Promise = require("bluebird");
var query = require("game-server-query");

function Tf2ServerService () {
}

Tf2ServerService.prototype = {
  getServerInfo: function (address) {
      console.log("tf2 server service getting info for server: " + address);

      return new Promise(function (resolve, reject) {
          var address = url.parse(address);

         query({
             type: "tf2",
             host: address.host,
             port: address.port
         }, function (response) {
            if (response.error) {
                reject(response);
            } else {
                resolve(response);
            }
         });
      }).then(function (serverInfo) {
          return {
              serverName: serverInfo.name,
              map: serverInfo.map,
              totalPlayers: serverInfo.players.length,
              maxPlayers: serverInfo.maxplayers
          }
      });
  }
};

module.exports = new Tf2ServerService();