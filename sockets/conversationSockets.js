const {
  createDM,
  createGroup,
  addToGroup,
  getUsers,
} = require("../services/conversationServices");

module.exports = (io, socket) => {
  socket.on("createConversation", async (data, callback) => {
    try {
      let conversation, participantIds;

      if (data.conversationType === "dm") {
        conversation = await createDM({
          targetUserId: data.targetUserId,
          loggedInUserId: socket.user._id,
        });

        participantIds = [
          socket.user._id.toString(),
          data.targetUserId.toString(),
        ];
      } else if (data.conversationType === "group") {
        conversation = await createGroup({
          participantIds: data.participantIds,
          groupName: data.groupName,
          loggedInUserId: socket.user._id,
        });

        participantIds = [
          ...data.participantIds.map((id) => id.toString()),
          socket.user._id.toString(),
        ];
      }

      participantIds.forEach((id) =>
        io.to(id).emit("newConversation", conversation)
      );

      // Send response back to creator
      if (callback) callback({ success: true, conversation });
    } catch (err) {
      console.error("Error in createConversation socket:", err);
      if (callback) callback({ success: false, error: err.message });
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
      const participantIds = await getUsers({
        conversationId: data.conversationId,
      });

      participantIds.forEach((id) => {
        io.to(id).emit("newMessage", newMessage);
      });

      for (const user of participantIds) {
        io.to(user._id.toString()).emit("newMessage", newMessage);
      }
    } catch (err) {
      socket.emit("errorMessage", err.message);
      console.error("Error in addToGroup");
    }
  });
};
