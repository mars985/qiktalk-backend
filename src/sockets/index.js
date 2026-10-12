const { socketAuth } = require("../middlewares/auth.middleware");
const userSockets = require("./user.socket");
const conversationSockets = require("./conversation.socket");
const messageSockets = require("./message.socket");

module.exports = (io) => {
  socketAuth(io);

  io.on("connection", (socket) => {
    userSockets(io, socket);
    messageSockets(io, socket);
    conversationSockets(io, socket);
  });
};
