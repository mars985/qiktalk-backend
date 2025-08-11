const {
  createDM,
  createGroup,
  addToGroup,
  getConversations,
} = require("../services/conversationServices");

module.exports = (io, socket) => {
  socket.on("createConversation", async (data) => {
    try {
      let conversation;
      if (data.conversationType === "dm") {
        conversation = await createDM({
          targetUserId: data.targetUserId,
          loggedInUserId: socket.user._id, // safe
        });
      } else if (data.conversationType === "group") {
        conversation = await createGroup({
          participantIds: data.participantIds,
          groupName: data.groupName,
          loggedInUserId: socket.user._id, // safe
        });
      }

      const conversations = await getConversations({
        loggedInUserId: socket.user._id,
      });
      io.to(socket.id).emit("conversations", conversations);
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });

  // Add user(s) to an existing group
  socket.on("addToGroup", async (data) => {
    try {
      const updatedGroup = await addToGroup({
        participantIds: data.participantIds,
        groupId: data.groupId,
      });

      if (!updatedGroup) {
        return socket.emit("errorMessage", "Group not found");
      }

      // Emit updated conversation to group members
      const conversations = await getConversations({
        loggedInUserId: socket.user._id,
      });
      updatedGroup.participants.forEach((participant) => {
        io.to(participant.toString()).emit("conversations", conversations);
      });
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });
};
