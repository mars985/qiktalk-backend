const { socketAuth } = require("../services/auth");
const conversationSockets = require("./conversationSockets");
const messageSockets = require("./messageSockets");

module.exports = (io) => {
  socketAuth(io);

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.user.email);
    socket.on("userlogin", (userId) => {
      socket.join(userId);
    });

    messageSockets(io, socket);
    conversationSockets(io, socket);

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });
  });
};
