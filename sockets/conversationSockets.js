const {
  createDM,
  createGroup,
  addToGroup,
  getUsers,
} = require("../services/conversationServices");

module.exports = (io, socket) => {
  socket.on("createConversation", async (data) => {
    try {
      let conversation;

      if (data.conversationType === "dm") {
        conversation = await createDM({
          targetUserId: data.targetUserId,
          loggedInUserId: socket.user._id,
        });

        // Emit to both participants (creator + target user)
        const participantIds = [socket.user._id, data.targetUserId];
        for (const id of participantIds) {
          const convs = await getConversations({
            loggedInUserId: id.toString(),
          });
          io.to(id.toString()).emit("newDM", convs);
        }
      } else if (data.conversationType === "group") {
        conversation = await createGroup({
          participantIds: data.participantIds,
          groupName: data.groupName,
          loggedInUserId: socket.user._id,
        });

        // Include the creator in the participant list
        const participantIds = [...data.participantIds, socket.user._id];
        for (const id of participantIds) {
          const convs = await getConversations({
            loggedInUserId: id.toString(),
          });
          io.to(id.toString()).emit("newGroup", convs);
        }
      }
    } catch (err) {
      socket.emit("errorMessage", err.message);
      console.error("Error in createConversation socket");
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
