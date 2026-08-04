const messageService = require("../services/messageServices");

async function getMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const messages = await messageService.getMessages({ conversationId });

    if (!messages) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

async function sendMessage(req, res) {
  try {
    const { message, conversationId, senderId } = req.body;

    const newMessage = await messageService.sendMessage({
      message,
      conversationId,
      senderId,
    });

    res.json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

module.exports = {
  getMessages,
  sendMessage,
};
