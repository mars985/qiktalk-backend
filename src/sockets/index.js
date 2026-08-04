const { socketAuth } = require("../services/auth");
const userSockets = require("./userSockets");
const conversationSockets = require("./conversationSockets");
const messageSockets = require("./messageSockets");

module.exports = (io) => {
  socketAuth(io);

  io.on("connection", (socket) => {
    userSockets(io, socket);
    messageSockets(io, socket);
    conversationSockets(io, socket);
  });
};
